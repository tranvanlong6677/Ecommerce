import { Global, Module } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { HashingService } from './services/hashing.service'
import { JwtModule } from '@nestjs/jwt'
import { TokenService } from './services/token.service'
import { AccessTokenGuard } from './guards/access-token-guard'
import { APIKeyGuard } from './guards/api-key-guard'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard } from './guards/auth-guard'

const sharedServices = [PrismaService, HashingService, TokenService]

@Global()
@Module({
  providers: [
    ...sharedServices,
    AccessTokenGuard,
    APIKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [...sharedServices],
  imports: [JwtModule],
})
export class SharedModule {}
