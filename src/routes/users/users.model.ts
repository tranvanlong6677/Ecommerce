import { UserStatus } from 'src/shared/constants/auth.constants'
import { z } from 'zod'

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email().max(500),
  name: z.string().max(500).min(4),
  password: z.string().max(500),
  phoneNumber: z.string().max(50),
  avatar: z.string().max(1000).default('').nullable().optional(),
  totpSecret: z.string().max(1000).default('').nullable().optional(),
  status: z.nativeEnum(UserStatus),
  roleId: z.number(),
  createdById: z.number().nullable().optional(),
  createdAt: z.date().nullable().optional(),
  updatedAt: z.date().nullable().optional(),
})

export const GetUserResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
  roleId: true,
}).extend({
  role: z.object({
    id: z.number(),
    name: z.string(),
  }),
})

export const CreateUsersSchema = z.object({
  email: z.string().email().max(500),
  name: z.string().max(500).min(4),
  password: z.string().max(500),
  phoneNumber: z.string().max(50).default(''),
  avatar: z.string().max(1000).default(''),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  roleId: z.number().nullable().optional(),
})

export const UpdateUsersSchema = CreateUsersSchema

export const GetUsersQuerySchema = z.object({
  page: z.coerce.number().int().default(1),
  limit: z.coerce.number().int().default(10),
})

export const GetUsersResSchema = z.object({
  data: z.array(
    UserSchema.omit({ password: true, totpSecret: true, roleId: true }).extend({
      role: z.object({
        id: z.number(),
        name: z.string(),
      }),
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const GetUserParamsSchema = z.object({
  userId: z.number(),
})

export type UserSchemaType = z.infer<typeof UserSchema>
export type CreateUsersSchemaType = z.infer<typeof CreateUsersSchema>
export type UpdateUsersSchemaType = z.infer<typeof UpdateUsersSchema>
export type GetUsersQuerySchemaType = z.infer<typeof GetUsersQuerySchema>
export type GetUsersResSchemaType = z.infer<typeof GetUsersResSchema>
export type GetUserResSchemaType = z.infer<typeof GetUserResSchema>
