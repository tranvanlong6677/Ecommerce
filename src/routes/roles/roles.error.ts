import { UnprocessableEntityException } from '@nestjs/common'

export const RoleAlreadyExistsError = new UnprocessableEntityException('Role already exists')
export const RoleNotFoundError = new UnprocessableEntityException('Role not found')
