import { ParseFileOptions, ParseFilePipe } from '@nestjs/common'
import { unlinkSync } from 'fs'

export class ParseFilePipeWithUnlink extends ParseFilePipe {
  constructor(options?: ParseFileOptions) {
    super(options)
  }

  async transform(files: Array<Express.Multer.File>): Promise<Array<Express.Multer.File>> {
    const result = await super.transform(files).catch(async (e) => {
      await Promise.all(files.map((file) => unlinkSync(file.path)))
      throw e
    })

    return result
  }
}
