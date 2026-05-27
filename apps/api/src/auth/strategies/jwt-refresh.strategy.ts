import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service.js';

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null =>
          (req?.cookies?.['refresh_token'] as string | undefined) ?? null,
      ]),
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET')!,
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<unknown> {
    const user = await this.usersService.findById(payload.sub);
    if (!user.isActive) throw new UnauthorizedException();
    return user as unknown;
  }
}
