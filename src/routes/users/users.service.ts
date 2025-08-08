import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  CreateUsersSchemaType,
  GetUsersQuerySchemaType,
  UpdateUsersSchemaType,
} from './users.model'
import { UsersRepository } from './users.repo'
import {
  isForeignKeyConstraintPrismaError,
  isNotFoundPrismaError,
  isUniqueContraintPrismaError,
} from 'src/shared/helpers'
import { AccessTokenCreatePayload } from 'src/shared/types/jwt.types'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'
import { Prisma } from '@prisma/client'
import { NotFoundRecordException } from 'src/shared/error'
import { RoleNotFoundException } from './users.error'
import { RoleName } from 'src/shared/constants/role.constant'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly sharedRoleRepository: SharedRoleRepository,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}

  private async getRoleIdByUserId(userId: number) {
    const currentUser = await this.sharedUserRepository.findUnique({
      id: userId,
      deletedAt: null,
    })
    if (!currentUser) {
      throw NotFoundRecordException
    }
    return currentUser.roleId
  }

  async create({
    data,
    createdUser,
    createdByRoleName,
  }: {
    data: CreateUsersSchemaType
    createdUser: AccessTokenCreatePayload
    createdByRoleName: (typeof RoleName)[keyof typeof RoleName]
  }) {
    try {
      const user = await this.usersRepo.findUnique({ email: data.email })
      if (user) {
        throw new BadRequestException(`Email.AlreadyExists`)
      }

      await this.usersRepo.verifyRole({
        roleNameAgent: createdByRoleName,
        roleIdTarget: data.roleId ?? 0,
      })

      return this.usersRepo.create({
        data,
        createdById: createdUser?.userId,
      })
    } catch (error) {
      if (isForeignKeyConstraintPrismaError(error)) {
        throw RoleNotFoundException
      }
      if (isUniqueContraintPrismaError(error)) {
        throw new BadRequestException('Email already exists')
      }

      throw error
    }
  }

  findAll({ page, limit }: GetUsersQuerySchemaType) {
    return this.usersRepo.findAll({ page, limit })
  }

  async findOne(id: number) {
    try {
      const user = await this.usersRepo.findUnique({ id })
      if (!user) {
        throw NotFoundRecordException
      }

      return user
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      throw error
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUsersSchemaType,
    updatedById: number,
    updatedByRoleName: (typeof RoleName)[keyof typeof RoleName],
  ) {
    this.usersRepo.verifyYourself({
      userAgentId: updatedById,
      userTargetId: id,
    })

    const getAdminRoleId = await this.sharedRoleRepository.getAdminRoleId()
    const roleIdTarget = await this.getRoleIdByUserId(id)
    await this.usersRepo.verifyRole({
      roleNameAgent: updatedByRoleName,
      roleIdTarget,
    })
    if (
      updateUserDto?.roleId === getAdminRoleId &&
      updatedById !== getAdminRoleId
    ) {
      throw new BadRequestException(
        `You are not authorized to update an admin user`,
      )
    }

    const user = await this.usersRepo.findUnique({ id })
    if (!user) {
      throw new NotFoundException(`User not found`)
    }

    const isExistEmail = await this.usersRepo.findUnique({
      email: updateUserDto.email,
    })
    if (isExistEmail) {
      throw new BadRequestException(`Email already exists`)
    }

    return this.usersRepo.update({ id, data: updateUserDto, updatedById })
  }

  async remove(
    id: number,
    deletedById: number,
    deletedByRoleName: (typeof RoleName)[keyof typeof RoleName],
  ) {
    try {
      this.usersRepo.verifyYourself({
        userAgentId: deletedById, // id của user đang xóa
        userTargetId: id,
      })
      const roleIdTarget = await this.getRoleIdByUserId(id)
      await this.usersRepo.verifyRole({
        roleNameAgent: deletedByRoleName,
        roleIdTarget,
      })
      await this.usersRepo.delete({ id, isHard: false })
      return {
        message: 'User is deleted successfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
