import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { RoleService } from './roles.service'
import { AuthRepository } from './auth.repo'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'

@Module({
  controllers: [AuthController],
  providers: [AuthService, RoleService, AuthRepository, SharedUserRepository],
})
export class AuthModule {}
