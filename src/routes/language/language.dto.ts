import { createZodDto } from 'nestjs-zod'
import {
  CreateLanguageSchema,
  GetLanguageParamsSchema,
  GetLanguageResSchema,
  GetLanguagesResSchema,
  UpdateLanguageSchema,
} from './language.model'

export class CreateLanguageDto extends createZodDto(CreateLanguageSchema) {}
export class UpdateLanguageDto extends createZodDto(UpdateLanguageSchema) {}
export class GetLanguagesResDto extends createZodDto(GetLanguagesResSchema) {}
export class GetLanguageParamsDto extends createZodDto(GetLanguageParamsSchema) {}
export class GetLanguageResDto extends createZodDto(GetLanguageResSchema) {}
