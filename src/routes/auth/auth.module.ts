import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { RoleService } from './roles.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService, RoleService],
})
export class AuthModule {}
