import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { HashingService } from '../services/hashing.service'
import { TokenService } from '../services/token.service'
import { RoleService } from 'src/routes/auth/roles.service'
import { UserType } from '../models/shared-user.model'

@Injectable()
export class SharedUserRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly roleService: RoleService,
  ) {}
  async findUnique(uniqueObject: { email: string } | { id: number }): Promise<UserType | null> {
    return this.prismaService.user.findUnique({
      where: uniqueObject,
      omit: {},
    })
  }
}
