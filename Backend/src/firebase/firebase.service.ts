import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  cert,
  getApps,
  initializeApp,
  App,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService {
  private readonly app: App;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const credentialsPath =
      this.configService.get<string>(
        'FIREBASE_CREDENTIALS_PATH',
      );

    if (!credentialsPath) {
      throw new Error(
        'FIREBASE_CREDENTIALS_PATH is not configured',
      );
    }

    const absolutePath = path.resolve(
      process.cwd(),
      credentialsPath,
    );

    if (!fs.existsSync(absolutePath)) {
      throw new Error(
        `Firebase credentials file not found: ${absolutePath}`,
      );
    }

    const serviceAccount = JSON.parse(
      fs.readFileSync(absolutePath, 'utf8'),
    );

    const existingApps = getApps();

    this.app =
      existingApps.length > 0
        ? existingApps[0]
        : initializeApp({
            credential: cert(serviceAccount),
            projectId:
              this.configService.get<string>(
                'FIREBASE_PROJECT_ID',
              ),
          });
  }

  async verifyIdToken(token: string) {
    try {
      return await getAuth(this.app).verifyIdToken(token);
    } catch (error) {
      throw new UnauthorizedException({
        status: 'error',
        message: 'Invalid Firebase token',
      });
    }
  }
}