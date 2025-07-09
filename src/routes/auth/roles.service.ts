import { Injectable } from '@nestjs/common'
import { RoleName } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'
import { RoleType } from './auth.model'

@Injectable()
export class RoleService {
  constructor(private readonly prismaService: PrismaService) {}
  private clientRoleId: number | null = null
  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }

    console.log('RoleName.Client', RoleName.Client)

    const role: RoleType | undefined = await this.prismaService
      .$queryRaw`SELECT * FROM "Role" WHERE name = ${RoleName.Client} AND "deletedAt" IS NULL LIMIT 1`.then(
      (res) => res?.[0],
    )

    if (!role) {
      throw new Error('Client role not found')
    }

    this.clientRoleId = role.id
    return role.id
  }
}

new RoleService(new PrismaService()).getClientRoleId()
