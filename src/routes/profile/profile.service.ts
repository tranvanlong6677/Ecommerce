import { Injectable } from '@nestjs/common'
import { ProfileRepository } from './profile.repo'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError } from 'src/shared/helpers'
import { ChangePasswordBodySchemaType, GetProfileResSchema } from 'src/shared/models/shared-user.model'
import { UpdateProfileBodySchemaType } from './profile.model'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly sharedUserRepo: SharedUserRepository,
  ) {}
  async getProfile(userId: number) {
    try {
      const profile = await this.sharedUserRepo.findUniqueWithRolePermissions({ id: userId, deletedAt: null })
      return GetProfileResSchema.parse(profile)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async updateProfile(userId: number, data: UpdateProfileBodySchemaType) {
    try {
      return await this.sharedUserRepo.updateProfile(userId, data)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async changePassword(userId: number, data: ChangePasswordBodySchemaType) {
    return await this.profileRepository.changePassword(userId, data)
  }
}
