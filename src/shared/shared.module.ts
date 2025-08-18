import { Global, Module } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { HashingService } from './services/hashing.service'
import { JwtModule } from '@nestjs/jwt'
import { TokenService } from './services/token.service'
import { AccessTokenGuard } from './guards/access-token-guard'
import { APIKeyGuard } from './guards/api-key-guard'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard } from './guards/auth-guard'
import { SharedUserRepository } from './repositories/shared-user.repo'
import { SharedRoleRepository } from './repositories/shared-role.repo'
import { S3Service } from './services/s3.service'

const sharedServices = [PrismaService, HashingService, TokenService, S3Service]

@Global()
@Module({
  providers: [
    ...sharedServices,
    SharedUserRepository,
    SharedRoleRepository,
    AccessTokenGuard,
    APIKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [...sharedServices, SharedUserRepository, SharedRoleRepository],
  imports: [JwtModule],
})
export class SharedModule {}
