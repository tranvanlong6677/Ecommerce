import { z } from 'zod'
import { UserStatus } from '../constants/auth.constants'
import { RoleSchema } from './shared-role.model'
import { PermissionSchema } from './shared-permission.model'

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(6).max(100),
  phoneNumber: z.string().min(9).max(15),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  roleId: z.number().positive(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const GetProfileResSchema = UserSchema.pick({
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  avatar: true,
  roleId: true,
}).extend({
  role: RoleSchema.pick({ id: true, name: true }).extend({
    permissions: PermissionSchema.pick({
      id: true,
      name: true,
      path: true,
      method: true,
      module: true,
    }).array(),
  }),
})

export const ChangePasswordBodySchema = z
  .object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  })
  .superRefine(({ confirmPassword, newPassword }, ctx) => {
    if (confirmPassword !== newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'New password and confirm password must match',
        path: ['confirmPassword'],
      })

      ctx.addIssue({
        code: 'custom',
        message: 'New password and current password must not match',
        path: ['newPassword'],
      })
    }
  })

export type UserType = z.infer<typeof UserSchema>
export type GetProfileResType = z.infer<typeof GetProfileResSchema>
export type ChangePasswordBodySchemaType = z.infer<typeof ChangePasswordBodySchema>
