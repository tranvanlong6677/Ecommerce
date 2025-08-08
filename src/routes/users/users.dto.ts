import { createZodDto } from 'nestjs-zod'
import {
  CreateUsersSchema,
  GetUsersQuerySchema,
  GetUsersResSchema,
  GetUserParamsSchema,
  GetUserResSchema,
  UpdateUsersSchema,
} from './users.model'

export class CreateUserDto extends createZodDto(CreateUsersSchema) {}
export class GetUsersQueryDTO extends createZodDto(GetUsersQuerySchema) {}
export class GetUsersResDto extends createZodDto(GetUsersResSchema) {}
export class GetUserParamsDto extends createZodDto(GetUserParamsSchema) {}
export class GetUserResDto extends createZodDto(GetUserResSchema) {}
export class UpdateUserDto extends createZodDto(UpdateUsersSchema) {}
