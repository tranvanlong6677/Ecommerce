import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { TokenService } from '../services/token.service'
import { REQUEST_USER_KEY } from '../constants/auth.constants'
import { AccessTokenPayload } from '../types/jwt.types'
import { HTTPMethod } from '@prisma/client'
import { PrismaService } from '../services/prisma.service'

// Bản chất của access-token-guard chỉ đơn giản là check xem access token có hợp lệ hay không
// Nếu hợp lệ thì trả về true, nếu không hợp lệ thì trả về false
// Nếu không hợp lệ thì sẽ throw ra lỗi UnauthorizedExceptionCustom

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const decodedAccessToken = await this.extractAndValidateToken(request)

    // check user permission
    await this.validateUserPermission(decodedAccessToken, request)
    return true
  }

  private async extractAndValidateToken(request: any): Promise<AccessTokenPayload> {
    const accessToken = this.extractAccessToken(request)
    try {
      // decode access token để lấy ra thông tin user cho vào decorator @User()
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)
      request[REQUEST_USER_KEY] = decodedAccessToken
      return decodedAccessToken
    } catch {
      throw new UnauthorizedException('Error.InvalidAccessToken')
    }
  }

  // private async extract
  private extractAccessToken(request: any) {
    const accessToken = request.headers.authorization?.split(' ')[1] as string
    if (!accessToken) {
      throw new UnauthorizedException('Error.MissingAccessToken')
    }
    return accessToken
  }

  private async validateUserPermission(decodedAccessToken: AccessTokenPayload, request: any): Promise<void> {
    const roleId = decodedAccessToken.roleId
    const path = request.route.path
    const method = request.method as HTTPMethod
    const role = await this.prismaService.role
      .findUnique({
        where: {
          id: roleId,
          deletedAt: null,
          isActive: true,
        },
        include: {
          permissions: {
            where: {
              deletedAt: null,
              path,
              method,
            },
          },
        },
      })
      .catch(() => {
        throw new ForbiddenException()
      })

    if (!role) {
      throw new UnauthorizedException('Error.InvalidRole')
    }

    const canAccess = role.permissions.length > 0
    if (!canAccess) {
      throw new ForbiddenException()
    }
  }
}
