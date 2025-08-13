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
} from '@nestjs/common'
import { MediaService } from './media.service'
import { CreateMediaDto } from './dto/create-media.dto'
import { UpdateMediaDto } from './dto/update-media.dto'
import { FileInterceptor } from '@nestjs/platform-express'
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
