import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() { }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    try {
      console.log('Google user:', req.user.email);

      const result = await this.authService.googleLogin(req.user);

      console.log('Login successful');

      const isProduction = process.env.NODE_ENV === 'production';

      res.cookie('access_token', result.access_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/dashboard`);
    } catch (error) {
      console.error('Login error:', error.message);

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(
        `${frontendUrl}/login?error=${encodeURIComponent(error.message)}`,
      );
    }
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getCurrentUser(@Req() req) {
    return req.user;
  }

  @Get('verify')
  @UseGuards(AuthGuard('jwt'))
  verifyToken(@Req() req) {
    return {
      valid: true,
      user: req.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  logout(@Req() req, @Res() res) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: "none",
      path: '/',
    });

    return res.json({
      message: 'Logged out successfully',
      userId: req.user['id'],
    });
  }

  @Get('status')
  getStatus() {
    return {
      status: 'connected',
      version: 'v1',
      timestamp: new Date().toISOString(),
    };
  }
}
