import { createZodDto } from 'nestjs-zod'
import { ChangePasswordBodySchema } from 'src/shared/models/shared-user.model'
import { UpdateProfileBodySchema } from './profile.model'

export class ChangePasswordBodyDto extends createZodDto(ChangePasswordBodySchema) {}
export class UpdateProfileBodyDto extends createZodDto(UpdateProfileBodySchema) {}
