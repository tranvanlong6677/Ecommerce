import { BadRequestException, Module } from '@nestjs/common'
import { MediaService } from './media.service'
import { ALLOWED_MIME, MediaController } from './media.controller'
import { MulterModule } from '@nestjs/platform-express/multer/multer.module'
import path from 'path'
import { diskStorage } from 'multer'
import { generateRandomFileName } from 'src/shared/helpers'

const UPLOAD_PATH = path.resolve('uploads')

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: function (req, file, cb) {
          cb(null, UPLOAD_PATH)
        },
        filename: (_, file, callback) => {
          const newFileName = generateRandomFileName(file.originalname)
          console.log('>>> check newFileName ', newFileName)
          callback(null, newFileName)
        },
      }),
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
