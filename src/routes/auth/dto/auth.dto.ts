import { createZodDto } from 'nestjs-zod'
import {
  LoginBodySchema,
  RegisterBodySchema,
  RegisterResSchema,
  SendOTPBodySchema,
  LoginResSchema,
} from '../auth.model'

export class RegisterBodyDto extends createZodDto(RegisterBodySchema) {}
export class RegisterResDto extends createZodDto(RegisterResSchema) {}
export class SendOTPBodyDto extends createZodDto(SendOTPBodySchema) {}
export class LoginBodyDto extends createZodDto(LoginBodySchema) {}
export class LoginResDto extends createZodDto(LoginResSchema) {}
