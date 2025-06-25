import { createZodDto } from 'nestjs-zod'
import {
  GetRolesQuerySchema,
  GetRolesResSchema,
  GetRoleQuerySchema,
  GetRoleResSchema,
  CreateRoleBodySchema,
  CreateRoleResSchema,
  UpdateRoleBodySchema,
  UpdateRoleResSchema,
} from './roles.model'

export class GetRolesQueryDto extends createZodDto(GetRolesQuerySchema) {}
export class GetRolesResDto extends createZodDto(GetRolesResSchema) {}
export class GetRoleQueryDto extends createZodDto(GetRoleQuerySchema) {}
export class GetRoleResDto extends createZodDto(GetRoleResSchema) {}
export class CreateRoleBodyDto extends createZodDto(CreateRoleBodySchema) {}
export class CreateRoleResDto extends createZodDto(CreateRoleResSchema) {}
export class UpdateRoleBodyDto extends createZodDto(UpdateRoleBodySchema) {}
export class UpdateRoleResDto extends createZodDto(UpdateRoleResSchema) {}
