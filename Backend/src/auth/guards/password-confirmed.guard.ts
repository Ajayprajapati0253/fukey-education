import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

// Matches Laravel's default password-confirmation timeout (3 hours)
const CONFIRM_WINDOW_SECONDS = 3 * 60 * 60;

/**
 * Use alongside JwtAuthGuard on routes that require a recently-confirmed
 * password (e.g. changing email, deleting account) — mirrors Laravel's
 * 'password.confirm' middleware, but reads the claim off the JWT instead
 * of a server-side session.
 */
@Injectable()
export class PasswordConfirmedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const confirmedAt = request.user?.pwdConfirmedAt;

    if (!confirmedAt || Date.now() / 1000 - confirmedAt > CONFIRM_WINDOW_SECONDS) {
      throw new ForbiddenException('Please confirm your password to continue.');
    }

    return true;
  }
}