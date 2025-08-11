import { Module } from '@nestjs/common'
import { MediaService } from './media.service'
import { MediaController } from './media.controller'
import { MulterModule } from '@nestjs/platform-express/multer/multer.module'
import path, { extname } from 'path'
import { diskStorage } from 'multer'
import { generateRandomFileName } from 'src/shared/helpers'

const UPLOAD_PATH = path.resolve('upload')

console.log('>>> check Upload path ', UPLOAD_PATH)

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: UPLOAD_PATH,
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
