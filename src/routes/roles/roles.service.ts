import { Injectable } from '@nestjs/common'
import { CreateRoleBodyType, GetRoleQueryType, GetRolesQueryType, UpdateRoleBodyType } from './roles.model'
import { RolesRepository } from './roles.repo'
import { isNotFoundPrismaError, isUniqueContraintPrismaError } from 'src/shared/helpers'
import { NotFoundRecordException } from 'src/shared/error'
import { RoleName } from 'src/shared/constants/role.constant'
import { ProhibitedActionError, RoleAlreadyExistsError } from './roles.error'

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async findAll(query: GetRolesQueryType) {
    const { page, limit } = query
    const result = await this.rolesRepository.getAllRoles({ page, limit })
    return result
  }

  async findOne({ id }: GetRoleQueryType) {
    return await this.rolesRepository.findUnique({ id })
  }

  async create({ data, userId }: { data: CreateRoleBodyType; userId: number }) {
    await this.rolesRepository.findRoleByName({ name: data.name })
    return await this.rolesRepository.createRole({ data, userId })
  }

  async update({ roleId, data, userId }: { roleId: number; data: UpdateRoleBodyType; userId: number }) {
    try {
      await this.verifyRole(roleId)
      const role = await this.rolesRepository.findUnique({ id: roleId })
      if (!role) {
        throw NotFoundRecordException
      }
      const baseRoles: string[] = [RoleName.Admin]
      if (baseRoles.includes(role.name)) {
        throw ProhibitedActionError
      }
      return await this.rolesRepository.updateRole({ id: roleId, data, userId })
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      if (isUniqueContraintPrismaError(error)) {
        throw RoleAlreadyExistsError
      }

      throw error
    }
  }

  async remove({ roleId, userId, isHard = false }: { roleId: number; userId: number; isHard?: boolean }) {
    try {
      await this.verifyRole(roleId)
      const role = await this.rolesRepository.findUnique({ id: roleId })
      if (!role) {
        throw NotFoundRecordException
      }
      const baseRoles: string[] = [RoleName.Client, RoleName.Admin, RoleName.Seller]
      if (baseRoles.includes(role.name)) {
        throw ProhibitedActionError
      }
      return await this.rolesRepository.deleteRole({ id: roleId, userId, isHard })
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  private async verifyRole(roleId: number) {
    const role = await this.rolesRepository.findUnique({ id: roleId })
    if (!role) {
      throw NotFoundRecordException
    }
    const baseRoles: string[] = [RoleName.Admin, RoleName.Client, RoleName.Seller]

    if (baseRoles.includes(role.name)) {
      throw ProhibitedActionError
    }
  }
}
