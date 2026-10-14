
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { extname, join } from 'path';
import { randomBytes } from 'crypto';
import { mkdirSync } from 'fs';

import { StudyMaterialService } from '../services/study-material.service';
import { CreateStudyMaterialDto } from '../dto/create-study-material.dto';
import { UpdateStudyMaterialDto } from '../dto/update-study-material.dto';

const UPLOAD_DIRECTORY = join(
  process.cwd(),
  'public',
  'uploads',
  'notes',
);

const pdfStorage = diskStorage({
  destination: (req, file, cb) => {
    try {
      mkdirSync(UPLOAD_DIRECTORY, { recursive: true });
      cb(null, UPLOAD_DIRECTORY);
    } catch (error) {
      cb(error as Error, '');
    }
  },

  filename: (req, file, cb) => {
    const name =
      file.originalname
        .replace(/\.pdf$/i, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'document';

    const uniqueSuffix = randomBytes(6).toString('hex');

    cb(null, `${name}_${uniqueSuffix}.pdf`);
  },
});

const pdfUploadOptions = {
  storage: pdfStorage,

  limits: {
    fileSize: 20 * 1024 * 1024,
  },

  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    const isPdfExtension =
      extname(file.originalname).toLowerCase() === '.pdf';

    const isPdfMimeType = file.mimetype === 'application/pdf';

    if (!isPdfExtension || !isPdfMimeType) {
      return cb(
        new BadRequestException('Only PDF files are allowed'),
        false,
      );
    }

    cb(null, true);
  },
};

@Controller('admin/study-material')
export class StudyMaterialController {
  constructor(
    private readonly studyMaterialService: StudyMaterialService,
  ) {}

  // Get all study materials
  @Get()
  findAll(
    @Query()
    query: {
      page?: string;
      limit?: string;
      type?: string;
      class_category_id?: string;
      subject_category_id?: string;
      search?: string;
    },
  ) {
    return this.studyMaterialService.findAll(query);
  }

  // Get study material by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studyMaterialService.findOne(id);
  }

  // Create study material without file upload
  @Post()
  create(@Body() createStudyMaterialDto: CreateStudyMaterialDto) {
    return this.studyMaterialService.create(createStudyMaterialDto);
  }

  // Update study material
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStudyMaterialDto: UpdateStudyMaterialDto,
  ) {
    return this.studyMaterialService.update(id, updateStudyMaterialDto);
  }

  // Delete study material
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studyMaterialService.remove(id);
  }

  // Upload single PDF
  @Post('upload')
  @UseInterceptors(FileInterceptor('pdf', pdfUploadOptions))
  uploadSingle(
    @UploadedFile() file: Express.Multer.File,
     @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('PDF file is required');
    }

    return this.studyMaterialService.uploadSingle(file, body);
  }

  // Bulk upload PDFs
  @Post('bulk-upload')
  @UseInterceptors(
    FilesInterceptor('bulk_pdfs', 50, {
      ...pdfUploadOptions,
      limits: {
        fileSize: 20 * 1024 * 1024,
        files: 50,
      },
    }),
  )
  uploadBulk(
    @UploadedFiles() files: Express.Multer.File[],
     @Body() body: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        'At least one PDF file is required',
      );
    }

    return this.studyMaterialService.uploadBulk(files, body);
  }
}
