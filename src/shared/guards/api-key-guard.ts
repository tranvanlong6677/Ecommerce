import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import envConfig from '../config'
import { UnauthorizedExceptionCustom } from 'src/routes/auth/auth.error'

@Injectable()
export class APIKeyGuard implements CanActivate {
  constructor() {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const xAPIKey = request.headers['x-api-key']
    if (xAPIKey !== envConfig.SECRET_API_KEY) {
      throw UnauthorizedExceptionCustom
    }
    return true
  }
}
