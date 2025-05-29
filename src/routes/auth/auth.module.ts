import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { RoleService } from './roles.service'
import { AuthRepository } from './auth.repo'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { EmailService } from 'src/shared/services/email.service'
import { GoogleService } from './google.service'
import { TwoFactorAuthService } from 'src/shared/services/2fa.service'

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    RoleService,
    AuthRepository,
    SharedUserRepository,
    EmailService,
    GoogleService,
    TwoFactorAuthService,
  ],
})
export class AuthModule {}
