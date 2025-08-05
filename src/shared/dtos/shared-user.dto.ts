import { createZodDto } from 'nestjs-zod'
import { GetProfileResSchema } from '../models/shared-user.model'

export class GetProfileResDto extends createZodDto(GetProfileResSchema) {}
export class UpdateProfileResDto extends createZodDto(GetProfileResSchema) {}
