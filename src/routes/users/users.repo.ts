import { ForbiddenException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateUsersSchemaType,
  UpdateUsersSchemaType,
  GetUserResSchema,
} from './users.model'
import { HashingService } from 'src/shared/services/hashing.service'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { RoleName } from 'src/shared/constants/role.constant'
import { CannotUpdateOrDeleteYourselfException } from './users.error'

@Injectable()
export class UsersRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingService,
    private readonly sharedRoleRepository: SharedRoleRepository,
  ) {}

  async findUnique(where: { id: number } | { email: string }) {
    return this.prisma.user.findUniqueOrThrow({
      where: { ...where, deletedAt: null },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  async findUniqueIncludeRole(where: { id: number } | { email: string }) {
    return this.prisma.user.findUnique({
      where: { ...where, deletedAt: null },
      include: { role: true },
    })
  }

  async findAll(
    where: { page: number; limit: number },
    include?: Prisma.UserInclude,
  ) {
    const { page, limit, ...rest } = where

    const [totalItems, data] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.findMany({
        where: { ...rest, deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          ...include,
          role: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ])

    return {
      data,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  async create({
    data,
    createdById,
  }: {
    data: CreateUsersSchemaType
    createdById: number
  }) {
    const now = new Date()
    const clientRoleId = await this.sharedRoleRepository.getClientRoleId()
    return await this.prisma.user.create({
      data: {
        ...data,
        roleId: data?.roleId || clientRoleId,
        password: await this.hashingService.hashPassword(data.password),
        createdById,
        createdAt: now,
        updatedById: createdById,
        updatedAt: now,
      },
    })
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: number
    data: UpdateUsersSchemaType
    updatedById: number
  }) {
    const now = new Date()
    const clientRoleId = await this.sharedRoleRepository.getClientRoleId()
    return await this.prisma.user.update({
      where: { id },
      data: {
        ...data,
        roleId: data?.roleId || clientRoleId,
        updatedById,
        updatedAt: now,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
  }

  async delete({ id, isHard }: { id: number; isHard: boolean }) {
    if (isHard) {
      return await this.prisma.user.delete({
        where: { id, deletedAt: null },
      })
    }
    return await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
  }

  async verifyRole({
    roleNameAgent,
    roleIdTarget,
  }: {
    roleNameAgent: (typeof RoleName)[keyof typeof RoleName]
    roleIdTarget: number
  }) {
    // Agent là admin thì cho phép
    if (roleNameAgent === RoleName.Admin) {
      return true
    } else {
      // Agent không phải admin thì roleIdTarget phải khác admin
      const adminRoleId = await this.sharedRoleRepository.getAdminRoleId()
      if (roleIdTarget === adminRoleId) {
        throw new ForbiddenException()
      }
      return true
    }
  }

  verifyYourself({
    userAgentId,
    userTargetId,
  }: {
    userAgentId: number
    userTargetId: number
  }) {
    if (userAgentId === userTargetId) {
      throw CannotUpdateOrDeleteYourselfException
    }
  }
}
