import { BadRequestException, Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

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
    if (!body.id_token) throw new BadRequestException('id_token is required')

    // Authenticate with Rumsan Office Client to get the user's cross-app role and ID
    const rumsanResult = await this.authService.loginWithGoogle(body.id_token).catch(e => {
      console.error("Rumsan login failed:", e.message);
      return null;
    });

    console.log("Rumsan login result:", rumsanResult);
    // Decode ID token to get profile info
    const jwtContent = JSON.parse(Buffer.from(body.id_token.split('.')[1], 'base64').toString());
console.log("Decoded JWT content:", jwtContent);

    // Run the Supabase/Prisma specific login
    return this.authService.googleLogin({
      email: jwtContent.email,
      firstName: jwtContent.given_name,
      lastName: jwtContent.family_name,
      picture: jwtContent.picture,
      googleId: jwtContent.sub,
      rumsanRole: (rumsanResult?.user as any)?.roles?.[0], // Fallback if Rumsan fails
    });
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@Request() req: any) {
    return req.user;
  }
}

