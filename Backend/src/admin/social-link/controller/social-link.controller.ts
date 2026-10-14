
import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { SocialLinkService } from '../services/social-link.service';
import { CreateSocialLinkDto } from '../dto/create-social-link.dto';
import { UpdateSocialLinkDto } from '../dto/update-social-link.dto';

import { createUploadOptions } from '../../../common/upload/upload.config';
import {
  UPLOAD_DIRECTORIES,
  ALLOWED_IMAGE_MIMES,
  MAX_IMAGE_SIZE,
} from '../../../common/upload/upload.constants';

const iconUploadOptions = createUploadOptions({
  directory: UPLOAD_DIRECTORIES.CUSTOM_IMAGES,
  allowedMimeTypes: ALLOWED_IMAGE_MIMES,
  maxSize: MAX_IMAGE_SIZE,
});

@Controller('admin/social-links')
export class SocialLinkController {
  constructor(
    private readonly socialLinkService: SocialLinkService,
  ) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,

    @Query('limit', new DefaultValuePipe(25), ParseIntPipe)
    limit: number,
  ) {
    return this.socialLinkService.findAll(page, limit);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.socialLinkService.findOne(BigInt(id));
  }

@Post()
@UseInterceptors(FileInterceptor('icon', iconUploadOptions))
create(
  @Body() dto: CreateSocialLinkDto,
  @UploadedFile() icon?: Express.Multer.File,
) {
  if (!icon) {
    throw new BadRequestException(
      'A valid icon image is required',
    );
  }

  const iconPath =
    `${UPLOAD_DIRECTORIES.CUSTOM_IMAGES}/${icon.filename}`;

  return this.socialLinkService.create(dto, iconPath);
}

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('icon', iconUploadOptions),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSocialLinkDto,
    @UploadedFile() icon?: Express.Multer.File,
  ) {
    const iconPath = icon
      ? `${UPLOAD_DIRECTORIES.CUSTOM_IMAGES}/${icon.filename}`
      : undefined;

    return this.socialLinkService.update(
      BigInt(id),
      dto,
      iconPath,
    );
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.socialLinkService.remove(BigInt(id));
  }
}
