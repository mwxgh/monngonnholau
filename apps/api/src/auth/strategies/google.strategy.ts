import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';

export interface GoogleProfile {
  email: string;
  name: string;
  avatar: string | null;
  providerId: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') || 'NOT_CONFIGURED',
      clientSecret:
        config.get<string>('GOOGLE_CLIENT_SECRET') || 'NOT_CONFIGURED',
      callbackURL: config.get<string>('GOOGLE_CALLBACK_URL')!,
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const user: GoogleProfile = {
      email: profile.emails![0].value,
      name: profile.displayName,
      avatar: profile.photos?.[0]?.value ?? null,
      providerId: profile.id,
    };
    done(null, user);
  }
}
