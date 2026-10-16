
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

import { PopupService } from '../services/popup.service';
import { CreatePopupDto } from '../dto/create-popup.dto';
import { UpdatePopupDto } from '../dto/update-popup.dto';

const uploadDir = join(process.cwd(), 'public', 'uploads', 'popups');

if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

const imageUploadOptions = {
  storage: diskStorage({
    destination: uploadDir,
    filename: (_req, file, callback) => {
      callback(
        null,
        `${randomUUID()}${extname(file.originalname).toLowerCase()}`,
      );
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(
        new BadRequestException('Only image files are allowed'),
        false,
      );
    }
    callback(null, true);
  },
};

@Controller('admin/popups')
export class PopupController {
  constructor(private readonly popupService: PopupService) {}

  private deleteImage(image?: string | null) {
    if (!image) return;

    // Only delete files inside this module's upload directory.
    const filename = image.split(/[\\/]/).pop();
    if (!filename) return;

    const target = join(uploadDir, filename);

    if (existsSync(target)) {
      unlinkSync(target);
    }
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.popupService.findAll(
      Number(page) || 1,
      Number(limit) || 10,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.popupService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async create(
    @Body() dto: CreatePopupDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      return await this.popupService.create(
        dto,
        file ? `uploads/popups/${file.filename}` : null,
      );
    } catch (error) {
      if (file) this.deleteImage(file.filename);
      throw error;
    }
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePopupDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const result = await this.popupService.update(
        id,
        dto,
        file ? `uploads/popups/${file.filename}` : undefined,
      );

      if (file && result.oldImage) {
        this.deleteImage(result.oldImage);
      }

      const { oldImage, ...response } = result;
      return response;
    } catch (error) {
      if (file) this.deleteImage(file.filename);
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.popupService.remove(id);
    this.deleteImage(result.image);

    const { image, ...response } = result;
    return response;
  }
}
