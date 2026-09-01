import { Injectable, Logger } from '@nestjs/common';

/**
 * ⚠️ STUB — Ye abhi sirf console log karta hai.
 * Laravel ka MailSenderService DB-stored EmailTemplate (GlobalSetting module,
 * Phase 16) aur dynamic SMTP config use karta hai — jab wo module migrate
 * hoga, is service ko real nodemailer/@nestjs-modules/mailer implementation
 * se replace karna hai.
 */

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendVerificationEmail(user: { name: string; email: string; verificationToken: string }): Promise<boolean> {
    this.logger.log(`[STUB] Verification email to ${user.email} — token: ${user.verificationToken}`);
    // TODO (Phase 16): EmailTemplate DB se fetch, placeholder replace, real SMTP se bhejna
    return true;
  }

  async sendForgotPasswordEmail(user: { name: string; email: string; forgetPasswordToken: string }): Promise<boolean> {
    this.logger.log(`[STUB] Forgot-password email to ${user.email} — token: ${user.forgetPasswordToken}`);
    // TODO (Phase 16): EmailTemplate DB se fetch, placeholder replace, real SMTP se bhejna
    return true;
  }
}