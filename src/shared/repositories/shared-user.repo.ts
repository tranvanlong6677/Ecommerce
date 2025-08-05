import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { UserType } from '../models/shared-user.model'
import { RoleType } from '../models/shared-role.model'
import { PermissionType } from '../models/shared-permission.model'
import { UpdateProfileBodySchemaType } from 'src/routes/profile/profile.model'

type UniqueUserType = { email: string; [key: string]: any } | { id: number; [key: string]: any }

type UserIncludeRolePermissionsType = UserType & { role: RoleType & { permissions: PermissionType[] } }

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async findUnique(uniqueObject: UniqueUserType): Promise<UserType | null> {
    return await this.prismaService.user.findUniqueOrThrow({
      where: uniqueObject,
      omit: {},
    })
  }

  async findUniqueWithRolePermissions(uniqueObject: UniqueUserType): Promise<UserIncludeRolePermissionsType | null> {
    return await this.prismaService.user.findUnique({
      where: uniqueObject,
      include: {
        role: { include: { permissions: { where: { deletedAt: null } } } },
      },
    })
  }

  async updateProfile(
    userId: number,
    data: UpdateProfileBodySchemaType,
  ): Promise<Partial<UserIncludeRolePermissionsType> | null> {
    return await this.prismaService.user.update({
      where: {
        id: userId,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        roleId: true,
        role: {
          include: {
            permissions: true,
          },
        },
      },
      data: { ...data, updatedAt: new Date(), updatedById: userId },
    })
  }
}
