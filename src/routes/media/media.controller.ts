import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common'
import { MediaService } from './media.service'
import { CreateMediaDto } from './dto/create-media.dto'
import { UpdateMediaDto } from './dto/update-media.dto'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  create(@Body() createMediaDto: CreateMediaDto) {
    return this.mediaService.create(createMediaDto)
  }

  @Post('images/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file)
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
