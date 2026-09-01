import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RecaptchaService {
  constructor(private config: ConfigService) {}

  async verify(token: string, remoteIp: string): Promise<boolean> {
    const secret = this.config.get<string>('RECAPTCHA_SECRET_KEY') ?? '';
    const params = new URLSearchParams({ secret, response: token, remoteip: remoteIp });

    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: params,
    });
    const data = await res.json();
    return data.success === true;
  }
}