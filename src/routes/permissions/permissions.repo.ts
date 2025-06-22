import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreatePermissionType,
  GetPermissionsQueryType,
  GetPermissionsResType,
  PermissionType,
  UpdatePermissionType,
} from './permissions.model'
import { HTTPMethod } from '@prisma/client'

@Injectable()
export class PermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}
  async createPermission({
    createdById,
    permission,
  }: {
    createdById: number | null
    permission: CreatePermissionType
  }): Promise<PermissionType | null> {
    // const existingPermission = await this.prisma.permission.findFirst({
    //   where: {
    //     path: permission.path,
    //     method: permission.method,
    //     deletedAt: null,
    //   },
    // })

    // if (existingPermission) {
    //   throw new ConflictException('Permission already exists')
    // }

    return await this.prisma.permission.create({
      data: {
        ...permission,
        createdById,
      },
    })
  }

  async findAllPermissions(pagination: GetPermissionsQueryType): Promise<GetPermissionsResType> {
    const { page, limit } = pagination
    const skip = (page - 1) * limit
    const [totalItems, data] = await Promise.all([
      this.prisma.permission.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prisma.permission.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
    ])

    return {
      totalItems,
      data,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }
  async findUnique(uniqueValue: { id: number }): Promise<PermissionType | null> {
    return await this.prisma.permission.findUnique({
      where: { ...uniqueValue, deletedAt: null },
    })
  }

  async findByPathAndMethod({ path, method }: { path: string; method: HTTPMethod }): Promise<PermissionType | null> {
    return await this.prisma.permission.findFirst({
      where: { path, method, deletedAt: null },
    })
  }

  async updatePermission({
    id,
    permission,
    updatedById,
  }: {
    id: number
    permission: UpdatePermissionType
    updatedById: number
  }): Promise<PermissionType | null> {
    // const isExistPermission = await this.findUnique({ id })

    // if (!isExistPermission) {
    //   throw new NotFoundException('Permission not found')
    // }

    return await this.prisma.permission.update({
      where: { id },
      data: {
        ...permission,
        updatedById,
      },
    })
  }

  async deletePermission({ id, deletedById, isHard }: { id: number; deletedById: number; isHard: boolean }) {
    return isHard
      ? await this.prisma.permission.delete({
          where: { id },
        })
      : await this.prisma.permission.update({
          where: { id },
          data: { deletedAt: new Date(), deletedById },
        })
  }
}
