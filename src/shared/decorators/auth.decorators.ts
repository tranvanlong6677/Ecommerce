import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AuthTypeType, ConditionGuardType, REQUEST_USER_KEY } from '../constants/auth.constants'
import { AccessTokenPayload } from '../types/jwt.types'

export const AUTH_TYPE_KEY = 'authType'

export type AuthTypeDecoratorPayload = { authTypes: AuthTypeType[]; options: { condition: ConditionGuardType } }

export const Auth = (authTypes: AuthTypeType[], options?: { condition: ConditionGuardType | undefined }) => {
  return SetMetadata(AUTH_TYPE_KEY, { authTypes, options })
}

export const User = createParamDecorator((field: keyof AccessTokenPayload | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const user: AccessTokenPayload | undefined = request[REQUEST_USER_KEY]
  return field ? user?.[field] : user
})

export const UserAgent = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest()
  return request.headers['user-agent']
})
