import { PermissionSchema } from 'src/shared/models/shared-permission.model'
import { RoleSchema } from 'src/shared/models/shared-role.model'
import { z } from 'zod'

export const GetRolesQuerySchema = z
  .object({
    page: z.coerce.number().int().default(1),
    limit: z.coerce.number().int().default(10),
  })
  .strict()

export const GetRolesResSchema = z
  .object({
    data: z.array(RoleSchema),
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  })
  .strict()

export const GetRoleQuerySchema = z
  .object({
    id: z.coerce.number().int(),
  })
  .strict()

export const GetRoleResSchema = z
  .object({
    data: RoleSchema.extend({ 
      permissions: z.array(PermissionSchema),
    }),
  })
  .strict()

export const CreateRoleBodySchema = RoleSchema.omit({ id: true })
export const CreateRoleResSchema = z.object({
  data: RoleSchema,
})

export const UpdateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
})
  .extend({
    permissionIds: z.array(z.number()),
  })
  .strict()

export const UpdateRoleResSchema = z.object({
  data: RoleSchema.extend({
    permissions: z.array(PermissionSchema),
  }),
})

export type RoleType = z.infer<typeof RoleSchema>
export type GetRolesQueryType = z.infer<typeof GetRolesQuerySchema>
export type GetRolesResType = z.infer<typeof GetRolesResSchema>
export type GetRoleQueryType = z.infer<typeof GetRoleQuerySchema>
export type GetRoleResType = z.infer<typeof GetRoleResSchema>
export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>
export type CreateRoleResType = z.infer<typeof CreateRoleResSchema>
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>
export type UpdateRoleResType = z.infer<typeof UpdateRoleResSchema>
