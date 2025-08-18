import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  BadRequestException,
  UploadedFiles,
  Res,
  NotFoundException,
} from '@nestjs/common'
import { MediaService } from './media.service'
import { CreateMediaDto } from './dto/create-media.dto'
import { UpdateMediaDto } from './dto/update-media.dto'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import envConfig from 'src/shared/config'
import { IsPublic } from 'src/shared/decorators/auth.decorators'
import path from 'path'
import { UPLOAD_PATH } from 'src/shared/constants/other.constants'
import { Response } from 'express'
// import { FileSizeValidationPipe } from 'src/shared/pipes/validation-upload-file.pipe'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_MIME = /^image\/(png|jpe?g|x-png|pjpeg)$/i

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  create(@Body() createMediaDto: CreateMediaDto) {
    return this.mediaService.create(createMediaDto)
  }

  // Cách 1: Tự viết và sử dụng Pipe để validate dữ liệu file
  // @Post('images/upload')
  // @UseInterceptors(FileInterceptor('file'))
  // uploadFile(@UploadedFile(new FileSizeValidationPipe()) file: Express.Multer.File) {
  //   console.log(file)
  //   return file
  // }

  // Cách 2: Dùng Pipe của nestjs
  @Post('images/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_MIME, skipMagicNumbersValidation: true }),
        ],
        exceptionFactory: (err) =>
          new BadRequestException(`Invalid file. Allowed: png, jpg, jpeg. Max: 5MB. Detail: ${err}`),
      }),
    )
    file: Express.Multer.File,
  ) {
    return file
  }

  @Post('images/upload-multiple')
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_MIME, skipMagicNumbersValidation: true }),
        ],
        exceptionFactory: (err) =>
          new BadRequestException(`Invalid file. Allowed: png, jpg, jpeg. Max: 5MB. Detail: ${err}`),
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    const urlFiles = files.map((file) => ({
      url: `${envConfig.APP_URL}/media/${file.filename}`,
      filename: file.filename,
      fileSize: file.size,
      mimetype: file.mimetype,
      originalname: file.originalname,
    }))
    return urlFiles
  }

  @Get('/:filename')
  @IsPublic()
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(path.resolve(UPLOAD_PATH, filename), (error) => {
      if (error) {
        const notfound = new NotFoundException('File not found')
        res.status(notfound.getStatus()).json(notfound.getResponse())
      }
    })
  }

  @Get()
  findAll() {
    return this.mediaService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMediaDto: UpdateMediaDto) {
    return this.mediaService.update(+id, updateMediaDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediaService.remove(+id)
  }
}
