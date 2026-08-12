import { CanActivate, ExecutionContext, Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RecaptchaService } from '../services/recaptcha.service';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(
    private recaptchaService: RecaptchaService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const secretConfigured = !!this.config.get<string>('RECAPTCHA_SECRET_KEY');

    // TODO (Phase 16 - GlobalSetting module): DB se recaptcha_status check karna hai
    // is stub ki jagah. Abhi sirf .env me key set hai to hi enforce karta hai.
    if (!secretConfigured) {
      return true;
    }

    const token = request.body?.gRecaptchaResponse;
    if (!token) {
      throw new BadRequestException({ 'g-recaptcha-response': 'Please complete the recaptcha to submit the form' });
    }

    const isValid = await this.recaptchaService.verify(token, request.ip);
    if (!isValid) {
      throw new BadRequestException({ 'g-recaptcha-response': 'Please complete the recaptcha to submit the form' });
    }

    return true;
  }
}