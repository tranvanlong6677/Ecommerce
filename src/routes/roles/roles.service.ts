import { BadRequestException, Injectable } from '@nestjs/common'
import { RoleNotFoundError } from './roles.error'
import { CreateRoleBodyType, GetRoleQueryType, GetRolesQueryType, UpdateRoleBodyType } from './roles.model'
import { RolesRepository } from './roles.repo'

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
    await this.rolesRepository.findUnique({ id: roleId })
    return await this.rolesRepository.updateRole({ id: roleId, data, userId })
  }

  async remove({ roleId, userId, isHard = false }: { roleId: number; userId: number; isHard?: boolean }) {
    await this.rolesRepository.findUnique({ id: roleId })
    return await this.rolesRepository.deleteRole({ id: roleId, userId, isHard })
  }
}
