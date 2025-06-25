import { Injectable } from '@nestjs/common'
import { RoleName } from 'src/shared/constants/role.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class RoleService {
  constructor(private readonly prismaService: PrismaService) {}
  private clientRoleId: number | null = null
  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }

    const role = await this.prismaService.role.findFirstOrThrow({
      where: {
        name: RoleName.Client,
      },
    })

    this.clientRoleId = role.id
    return role.id
  }
}
