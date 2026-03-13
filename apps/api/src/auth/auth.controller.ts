import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth
   * Body: { id_token: string }
   *
   * Authenticates the user via Google ID token.
   * Internally fetches a challenge, signs it with the app private key,
   * then calls the user API. Returns the JWT and user info.
   *
   * The `token` in the response should be used as:
   *   Authorization: Bearer <token>
   */
  @Post()
  async login(@Body() body: { id_token?: string }) {
    if (!body.id_token) throw new BadRequestException('id_token is required');

    // Run the Supabase/Prisma/Rumsan specific login process
    return this.authService.googleLogin(body.id_token);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Request() req: any) {
    return req.user;
  }
}
