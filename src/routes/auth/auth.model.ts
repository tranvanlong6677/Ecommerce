import { TypeOfVerificationCode } from 'src/shared/constants/auth.constants'
import { UserSchema } from 'src/shared/models/shared-user.model'
import { z } from 'zod'

export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(100),
    code: z.string().length(6),
  })
  .strict() // show lỗi khi dữ liệu gửi lên bị thừa
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and confirm password must match',
        path: ['confirmPassword'],
      })
    }
  })

export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

export const VerificationCodeSchema = z.object({
  id: z.number(),
  code: z.string().length(6),
  email: z.string().email(),
  type: z.enum([TypeOfVerificationCode.FORGOT_PASSWORD, TypeOfVerificationCode.REGISTER]),
  expiresAt: z.date(),
  createdAt: z.date(),
})

export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict()

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict()

export const LoginResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict()

export const RefreshTokenResSchema = LoginResSchema

export const DeviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  lastActive: z.date(),
  createdAt: z.date(),
  isActive: z.boolean(),
})

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  updatedAt: z.date(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const RefreshTokenSchema = z.object({
  token: z.string(),
  userId: z.number(),
  deviceId: z.number(),
  expiresAt: z.date(),
  createdAt: z.date(),
})

export const GoogleAuthStateSchema = DeviceSchema.pick({
  userAgent: true,
  ip: true,
})

export const GetAuthorizationUrlResSchema = z.object({
  url: z.string().url(),
})

export const ForgotPasswordBodySchema = z
  .object({
    email: z.string().email(),
    code: z.string().length(6),
    password: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
  })
  .strict()

export const LogoutBodySchema = RefreshTokenBodySchema

export const ChangePasswordBodySchema = z
  .object({
    email: z.string().email(),
    code: z.string().length(6),
    password: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and confirm password must match',
        path: ['confirmPassword'],
      })
    }
  })

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>

export type RegisterResType = z.infer<typeof RegisterResSchema>

export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>

export type LoginBodyType = z.infer<typeof LoginBodySchema>

export type LoginResType = z.infer<typeof LoginResSchema>

export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>

export type RefreshTokenResType = LoginResType

export type DeviceType = z.infer<typeof DeviceSchema>

export type RoleType = z.infer<typeof RoleSchema>

export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>

export type LogoutBodyType = z.infer<typeof LogoutBodySchema>

export type GoogleAuthStateType = z.infer<typeof GoogleAuthStateSchema>

export type GetAuthorizationUrlResType = z.infer<typeof GetAuthorizationUrlResSchema>

export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>

export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>
