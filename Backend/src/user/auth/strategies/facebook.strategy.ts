import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';

type DoneCallback = (error: any, user?: any, info?: any) => void;

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: process.env.FACEBOOK_APP_ID as string,
      clientSecret: process.env.FACEBOOK_APP_SECRET as string,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL as string,
      profileFields: ['id', 'emails', 'name', 'photos'],
      scope: ['email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: DoneCallback,
  ) {
    const { name, emails, photos, id } = profile;
    const callbackUser = {
      id,
      email: emails?.[0]?.value,
      name: name ? `${name.givenName} ${name.familyName ?? ''}`.trim() : profile.displayName,
      avatar: photos?.[0]?.value,
      token: accessToken,
      refreshToken,
    };
    done(null, callbackUser);
  }
}