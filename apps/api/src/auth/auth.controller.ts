import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { OAuthProvider } from '@prisma/client';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard.js';
import type { GoogleProfile } from './strategies/google.strategy.js';
import type { FacebookProfile } from './strategies/facebook.strategy.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Get('me')
  me(@CurrentUser() user: unknown) {
    return user;
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(
    @CurrentUser() user: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(user, res);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  // Google OAuth
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(
    @CurrentUser() profile: GoogleProfile,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.handleOAuthLogin(
      profile,
      OAuthProvider.GOOGLE,
      res,
    );
  }

  // Facebook OAuth
  @Public()
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  facebookAuth() {}

  @Public()
  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  facebookCallback(
    @CurrentUser() profile: FacebookProfile,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.handleOAuthLogin(
      profile,
      OAuthProvider.FACEBOOK,
      res,
    );
  }
}
