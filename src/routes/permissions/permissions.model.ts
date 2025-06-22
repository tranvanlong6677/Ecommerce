import { PermissionSchema } from 'src/shared/models/shared-permission.model'
import { z } from 'zod'

export const CreatePermissionSchema = PermissionSchema.pick({
  name: true,
  path: true,
  method: true,
}).strict()

export const UpdatePermissionSchema = CreatePermissionSchema

export const GetPermissionsResSchema = z
  .object({
    data: z.array(PermissionSchema),
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  })
  .strict()

export const GetPermissionsQuerySchema = z
  .object({
    page: z.coerce.number().int().default(1),
    limit: z.coerce.number().int().default(10),
  })
  .strict()

export const GetPermissionResSchema = PermissionSchema

export const GetPermissionParamsSchema = z
  .object({
    permissionId: z.coerce.number(),
  })
  .strict()

export type PermissionType = z.infer<typeof PermissionSchema>
export type CreatePermissionType = z.infer<typeof CreatePermissionSchema>
export type GetPermissionsResType = z.infer<typeof GetPermissionsResSchema>
export type GetPermissionResType = z.infer<typeof GetPermissionResSchema>
export type GetPermissionParamsType = z.infer<typeof GetPermissionParamsSchema>
export type UpdatePermissionType = z.infer<typeof UpdatePermissionSchema>
export type GetPermissionsQueryType = z.infer<typeof GetPermissionsQuerySchema>
