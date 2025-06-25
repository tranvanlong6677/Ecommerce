import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from './roles.model'
import { RoleNotFoundError } from './roles.error'
import { message } from 'antd'

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRoles({ page, limit }: GetRolesQueryType) {
    const skip = (page - 1) * limit
    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.role.count({
        where: {
          deletedAt: null,
        },
      }),
    ])
    return {
      data: roles,
      totalItems: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findUnique({ id }: { id: number }) {
    const data = await this.prisma.role.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        permissions: true,
      },
    })
    if (!data) throw RoleNotFoundError
    return { data }
  }

  async findRoleByName({ name }: { name: string }) {
    const data = await this.prisma.role.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    })

    if (!data) {
      throw new BadRequestException('Role already exists')
    }

    return data
  }
  async createRole({ data, userId }: { data: CreateRoleBodyType; userId: number }) {
    const result = await this.prisma.role.create({
      data: { ...data, createdById: userId },
    })
    return { data: result }
  }

  async updateRole({ id, data, userId }: { id: number; data: UpdateRoleBodyType; userId: number }) {
    const result = await this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        permissions: { set: data.permissionIds.map((id) => ({ id })) },
        updatedById: userId,
        updatedAt: new Date(),
      },
      include: {
        permissions: true,
      },
    })
    return { data: result }
  }

  async deleteRole({ id, userId, isHard }: { id: number; userId: number; isHard?: boolean }) {
    if (isHard) {
      await this.prisma.role.delete({
        where: { id },
      })
      return { message: 'Deleted successfully' }
    }

    await this.prisma.role.update({
      where: { id },
      data: { deletedById: userId, deletedAt: new Date() },
    })

    return { message: 'Deleted successfully' }
  }
}
