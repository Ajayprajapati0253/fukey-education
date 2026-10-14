
import {
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  existsSync,
  unlinkSync,
} from 'fs';
import {
  isAbsolute,
  relative,
  resolve,
  sep,
} from 'path';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  getRelativePath(directory: string, filename: string): string {
    return `${directory.replace(/\\/g, '/').replace(/\/$/, '')}/${filename}`;
  }

  deleteFile(relativePath?: string | null): boolean {
    if (!relativePath) return false;

    // Only allow deletion inside the application's uploads directory.
    const uploadsRoot = resolve(process.cwd(), 'uploads');
    const target = resolve(process.cwd(), relativePath);
    const rel = relative(uploadsRoot, target);

    if (
      !rel ||
      rel === '..' ||
      rel.startsWith(`..${sep}`) ||
      isAbsolute(rel)
    ) {
      this.logger.warn('Rejected file deletion outside upload directory');
      return false;
    }

    if (!existsSync(target)) return false;

    try {
      unlinkSync(target);
      return true;
    } catch (error) {
      this.logger.error(`Could not delete uploaded file: ${relativePath}`);
      return false;
    }
  }
}
