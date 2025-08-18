import { Injectable } from '@nestjs/common'
import { S3Service } from 'src/shared/services/s3.service'
import { unlink } from 'fs/promises'

@Injectable()
export class MediaService {
  constructor(private readonly s3Service: S3Service) {}
  async uploadFile(file: Express.Multer.File) {
    const result = await this.s3Service.uploadFile({
      fileName: 'images/' + file.filename,
      filePath: file.path,
      contentType: file.mimetype,
    })
    await unlink(file.path)
    return result
  }

  async uploadFiles(files: Array<Express.Multer.File>) {
    const result = await Promise.all(
      files.map((file) => {
        return this.s3Service
          .uploadFile({
            fileName: 'images/' + file.filename,
            filePath: file.path,
            contentType: file.mimetype,
          })
          ?.then((res) => {
            return {
              url: res.Location,
            }
          })
      }),
    )

    await Promise.all(files.map((file) => unlink(file.path)))
    return result
  }
}
