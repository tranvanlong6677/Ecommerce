import { Module } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { ProfileController } from './profile.controller'
import { ProfileRepository } from './profile.repo'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository, SharedUserRepository],
})
export class ProfileModule {}
