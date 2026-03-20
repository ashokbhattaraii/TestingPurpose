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
  constructor(private readonly authService: AuthService) { }

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
