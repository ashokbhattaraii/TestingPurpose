import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common'
import type { RsOfficeClient, JwtPayload } from '@rumsan/user'
import type { Request } from 'express'
import { RS_OFFICE_CLIENT } from '../rsoffice/rsoffice.module'
import { CryptoService } from './crypto.service'

import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator'
import { JwtService } from '@nestjs/jwt'

/**
 * Guards a route by verifying the ES256K JWT that the user received from /auth.
 *
 * On startup it fetches the API server's JWT signing public key via
 * GET /auth/public-key and caches it. Subsequent requests do a fast,
 * fully local secp256k1 signature check — no round-trip to the API.
 *
 * On success the decoded JWT payload is attached to `request.user`.
 */
@Injectable()
export class AuthGuard implements CanActivate, OnModuleInit {
  private readonly logger = new Logger(AuthGuard.name);
  private signingPublicKey: string | null = null;

  constructor(
    @Inject(RS_OFFICE_CLIENT) private readonly client: RsOfficeClient,
    private readonly crypto: CryptoService,
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) { }

  async onModuleInit(): Promise<void> {
    try {
      const { publicKey } = await this.client.auth.getPublicKey();
      this.signingPublicKey = publicKey;
      this.logger.log('JWT signing public key loaded from API');
    } catch (err) {
      this.logger.warn(
        `Could not load JWT signing public key on startup: ${err}`,
      );
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { user: JwtPayload }>()

    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }

    const token = authHeader.slice(7);

    // Lazily fetch the public key if startup fetch failed
    if (!this.signingPublicKey) {
      try {
        const { publicKey } = await this.client.auth.getPublicKey();
        this.signingPublicKey = publicKey;
      } catch {
        throw new UnauthorizedException(
          'Could not retrieve JWT signing public key',
        );
      }
    }

    let { valid, payload } = await this.crypto.verifyJwt(token, this.signingPublicKey)

    // Fallback: Try verifying with local JWT secret if crypto verification fails
    // This is because AuthService signs tokens with HS256 using JwtService
    if (!valid || !payload) {
      try {
        if (this.jwtService) {
          payload = await this.jwtService.verifyAsync(token) as JwtPayload;
          valid = true;
        }
      } catch (err) {
        console.error('Auth verification failed:', err.message);
      }
    }

    if (!valid || !payload) {
      throw new UnauthorizedException('Invalid or expired token')
    }

    // Attach the decoded payload so controllers can read user claims
    // Normalize: many parts of the app expect 'id' but JWT uses 'sub'
    const user = { ...payload } as any;
    if (user.sub && !user.id) user.id = user.sub;

    request.user = user;
    return true
  }
}
