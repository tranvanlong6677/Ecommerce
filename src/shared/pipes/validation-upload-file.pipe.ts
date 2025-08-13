import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common'

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value) {
      throw new BadRequestException('File is required')
    }

    // "value" is an object containing the file's attributes and metadata
    const fileLimit = 5 * 1024 * 1024
    if (value.size > fileLimit) {
      throw new BadRequestException('File too large')
    }
    return value
  }
}
