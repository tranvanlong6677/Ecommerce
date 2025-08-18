import { Module } from '@nestjs/common'
import { MediaService } from './media.service'
import { MediaController } from './media.controller'
import { MulterModule } from '@nestjs/platform-express/multer/multer.module'
import { diskStorage } from 'multer'
import { generateRandomFileName } from 'src/shared/helpers'
import { UPLOAD_PATH } from 'src/shared/constants/other.constants'

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: function (req, file, cb) {
          cb(null, UPLOAD_PATH)
        },
        filename: (_, file, callback) => {
          const newFileName = generateRandomFileName(file.originalname)
          callback(null, newFileName)
        },
      }),
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
