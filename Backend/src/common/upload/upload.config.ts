
import { BadRequestException } from '@nestjs/common';
import { diskStorage, Options } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';import { randomUUID } from 'crypto';
import { extname, resolve } from 'path';
import { mkdirSync } from 'fs';

export interface UploadConfig {
  directory: string;
  allowedMimeTypes: string[];
  maxSize: number;
}

export function createUploadOptions(
  config: UploadConfig,
): MulterOptions  {
  const uploadRoot = resolve(process.cwd(), config.directory);

  mkdirSync(uploadRoot, { recursive: true });

  return {
    storage: diskStorage({
      destination: (_req, _file, callback) => {
        callback(null, uploadRoot);
      },

      filename: (_req, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();

        if (!extension || !/^\.[a-z0-9]{1,10}$/.test(extension)) {
          return callback(
            new Error('Invalid file extension'),
            '',
          );
        }

        callback(null, `${randomUUID()}${extension}`);
      },
    }),

    limits: {
      fileSize: config.maxSize,
      files: 1,
    },


fileFilter: (_req, file, callback) => {
  const allowed = config.allowedMimeTypes.includes(file.mimetype);

  callback(null, allowed);
},

  };
}
