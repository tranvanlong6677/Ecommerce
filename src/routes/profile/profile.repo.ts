import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { HashingService } from 'src/shared/services/hashing.service'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError } from 'src/shared/helpers'
import { ChangePasswordBodySchemaType, GetProfileResType } from 'src/shared/models/shared-user.model'
import { UpdateProfileBodySchemaType } from './profile.model'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'

@Injectable()
export class ProfileRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashingService: HashingService,
    private readonly sharedUserRepo: SharedUserRepository,
  ) {}
  async findUnique(uniqueValue: { id: number } | { email: string }): Promise<GetProfileResType> {
    return await this.prismaService.user.findUniqueOrThrow({
      where: {
        ...uniqueValue,
        deletedAt: null,
      },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    })
  }

  async updateProfile(uniqueValue: { id: number } | { email: string }, data: UpdateProfileBodySchemaType) {
    return await this.prismaService.user.update({
      where: {
        ...uniqueValue,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        role: {
          include: {
            permissions: true,
          },
        },
      },
      data,
    })
  }

  async changePassword(userId: number, data: ChangePasswordBodySchemaType) {
    try {
      const user = await this.sharedUserRepo.findUnique({ id: userId, deletedAt: null })
      if (!user) {
        throw NotFoundRecordException
      }

      const password = await this.getPassword(userId)
      const isCurrentPasswordValid = await this.hashingService.compare(data.currentPassword, password)
      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect')
      }

      await this.prismaService.user.update({
        where: { id: userId, deletedAt: null },
        data: {
          password: await this.hashingService.hashPassword(data.newPassword),
        },
      })
      return { message: 'Password changed successfully' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async getPassword(userId: number) {
    try {
      const user = await this.prismaService.user.findUniqueOrThrow({
        where: { id: userId, deletedAt: null },
        select: { password: true },
      })
      return user.password
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
