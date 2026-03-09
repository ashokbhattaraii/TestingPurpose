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
  private readonly logger = new Logger(AuthGuard.name)
  private signingPublicKey: string | null = null

  constructor(
    @Inject(RS_OFFICE_CLIENT) private readonly client: RsOfficeClient,
    private readonly crypto: CryptoService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const { publicKey } = await this.client.auth.getPublicKey()
      this.signingPublicKey = publicKey
      this.logger.log('JWT signing public key loaded from API')
    } catch (err) {
      this.logger.warn(`Could not load JWT signing public key on startup: ${err}`)
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user: JwtPayload }>()

    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header')
    }

    const token = authHeader.slice(7)

    // Lazily fetch the public key if startup fetch failed
    if (!this.signingPublicKey) {
      try {
        const { publicKey } = await this.client.auth.getPublicKey()
        this.signingPublicKey = publicKey
      } catch {
        throw new UnauthorizedException('Could not retrieve JWT signing public key')
      }
    }

    const { valid, payload } = await this.crypto.verifyJwt(token, this.signingPublicKey)
    if (!valid || !payload) throw new UnauthorizedException('Invalid or expired token')

    // Attach the decoded payload so controllers can read user claims
    request.user = payload
    return true
  }
}
