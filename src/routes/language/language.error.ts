import { NotFoundException, UnprocessableEntityException } from '@nestjs/common'

export const LanguageExistsError = new UnprocessableEntityException([
  { message: 'Ngôn ngữ đã tồn tại', path: 'id', key: 'LANGUAGE_EXISTS' },
])

export const LanguageNotFoundError = new NotFoundException([
  { message: 'Ngôn ngữ không tồn tại', path: 'id', key: 'LANGUAGE_NOT_FOUND' },
])
