import { Injectable } from '@nestjs/common'
import { RoleName } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'
import { RoleType } from '../models/shared-role.model'

@Injectable()
export class SharedRoleRepository {
  constructor(private readonly prismaService: PrismaService) {}
  private clientRoleId: number | null = null
  private adminRoleId: number | null = null

  private async getRole(roleName: (typeof RoleName)[keyof typeof RoleName]) {
    const role: RoleType | undefined = await this.prismaService
      .$queryRaw`SELECT * FROM "Role" WHERE name = ${roleName} AND "deletedAt" IS NULL LIMIT 1`.then((res) => res?.[0])

    if (!role) {
      throw new Error('Client role not found')
    }

    return role
  }

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }

    const role: RoleType | undefined = await this.getRole(RoleName.Client)

    if (!role) {
      throw new Error('Client role not found')
    }

    this.clientRoleId = role.id
    return role.id
  }

  async getAdminRoleId() {
    if (this.adminRoleId) {
      return this.adminRoleId
    }

    const role: RoleType | undefined = await this.getRole(RoleName.Admin)

    if (!role) {
      throw new Error('Admin role not found')
    }

    this.adminRoleId = role.id
    return role.id
  }
}
