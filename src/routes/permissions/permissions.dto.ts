import { createZodDto } from 'nestjs-zod'
import {
  CreatePermissionSchema,
  GetPermissionParamsSchema,
  GetPermissionResSchema,
  GetPermissionsQuerySchema,
  GetPermissionsResSchema,
  UpdatePermissionSchema,
} from './permissions.model'

export class CreatePermissionDto extends createZodDto(CreatePermissionSchema) {}
export class GetPermissionParamsDto extends createZodDto(GetPermissionParamsSchema) {}
export class GetPermissionsResDto extends createZodDto(GetPermissionsResSchema) {}
export class GetPermissionResDto extends createZodDto(GetPermissionResSchema) {}
export class UpdatePermissionDto extends createZodDto(UpdatePermissionSchema) {}
export class GetPermissionsQueryDTO extends createZodDto(GetPermissionsQuerySchema) {}
