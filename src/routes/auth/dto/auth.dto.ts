import { createZodDto } from 'nestjs-zod'
import { RegisterBodySchema, RegisterResSchema } from '../auth.model'

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}
export class RegisterResDto extends createZodDto(RegisterResSchema) {}
