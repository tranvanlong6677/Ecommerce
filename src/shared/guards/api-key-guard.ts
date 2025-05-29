import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { TokenService } from '../services/token.service'
import envConfig from '../config'
import { UnauthorizedExceptionCustom } from 'src/routes/auth/auth.error'

@Injectable()
export class APIKeyGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const xAPIKey = request.headers['x-api-key']
    if (xAPIKey !== envConfig.SECRET_API_KEY) {
      throw UnauthorizedExceptionCustom
    }
    return true
  }
}
