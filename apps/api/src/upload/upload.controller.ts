import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service.js';

const ALLOWED_FOLDERS = ['products', 'users', 'categories'] as const;
type UploadFolder = (typeof ALLOWED_FOLDERS)[number];

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|webp|gif)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('folder') folder?: string,
  ) {
    const safeFolder: UploadFolder = ALLOWED_FOLDERS.includes(
      folder as UploadFolder,
    )
      ? (folder as UploadFolder)
      : 'products';

    const url = await this.uploadService.upload(file, safeFolder);
    return { url };
  }
}
