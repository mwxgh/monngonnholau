import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

export interface FacebookProfile {
  email: string;
  name: string;
  avatar: string;
  providerId: string;
}

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('FACEBOOK_APP_ID') || 'NOT_CONFIGURED',
      clientSecret: config.get<string>('FACEBOOK_APP_SECRET') || 'NOT_CONFIGURED',
      callbackURL: config.get<string>('FACEBOOK_CALLBACK_URL')!,
      scope: ['email'],
      profileFields: ['id', 'emails', 'name', 'picture'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: any, user: any) => void,
  ) {
    const user: FacebookProfile = {
      email: profile.emails?.[0]?.value ?? '',
      name: `${profile.name?.givenName} ${profile.name?.familyName}`.trim(),
      avatar: profile.photos?.[0]?.value ?? '',
      providerId: profile.id,
    };
    done(null, user);
  }
}
