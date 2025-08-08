import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { REQUEST_ROLE_PERMISSIONS } from '../constants/auth.constants'
import { RolePermissionType } from '../models/shared-role.model'

export const ActiveUser = createParamDecorator((field: keyof RolePermissionType | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const rolePermissions: RolePermissionType | undefined = request[REQUEST_ROLE_PERMISSIONS]
  return field ? rolePermissions?.[field] : rolePermissions
})
