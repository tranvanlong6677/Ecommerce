import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthType, ConditionGuard } from '../constants/auth.constants'
import { AUTH_TYPE_KEY, AuthTypeDecoratorPayload } from '../decorators/auth.decorators'
import { AccessTokenGuard } from './access-token-guard'
import { APIKeyGuard } from './api-key-guard'

// Bản chất của auth-guard chỉ đơn giản là check xem đã đăng nhập hay chưa
// Nếu đã đăng nhập thì trả về true, nếu chưa đăng nhập thì trả về false
// Nếu chưa đăng nhập thì sẽ check xem có phải là public route hay không
// Nếu là public route thì trả về true
// Nếu không phải public route thì trả về false

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate>
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: APIKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.BEARER]: this.accessTokenGuard,
      [AuthType.API_KEY]: this.apiKeyGuard, 
      [AuthType.NONE]: { canActivate: () => true },
    }
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.getAuthTypeValue(context)

    const guards = authTypeValue.authTypes.map((item) => {
      return this.authTypeGuardMap[item]
    })

    if (!authTypeValue.options?.condition) {
      const canActivate = await guards[0].canActivate(context)
      if (canActivate) {
        return true
      }
      return false
    }

    if (authTypeValue.options.condition === ConditionGuard.OR) {
      return this.handleOrCondition(context, guards)
    }

    if (authTypeValue.options?.condition === ConditionGuard.AND) {
      return this.handleAndCondition(context, guards)
    }
    return true
  }

  private getAuthTypeValue(context: ExecutionContext) {
    return (
      this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(AUTH_TYPE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? {
        authTypes: [AuthType.BEARER],
        options: {
          condition: ConditionGuard.AND,
        },
      }
    )
  }

  private async handleOrCondition(context: ExecutionContext, guards: CanActivate[]) {
    let lastError: any = null

    for (const guard of guards) {
      try {
        if (await guard.canActivate(context)) {
          return true
        }
      } catch (error) {
        lastError = error
      }
    }
    if (lastError instanceof HttpException) {
      throw lastError
    }

    throw new UnauthorizedException()
  }

  private async handleAndCondition(context: ExecutionContext, guards: CanActivate[]) {
    for (const guard of guards) {
      try {
        if (!(await guard.canActivate(context))) {
          throw new UnauthorizedException()
        }
      } catch (error) {
        if (error instanceof HttpException) {
          throw error
        }

        throw new UnauthorizedException()
      }
    }

    return true
  }
}
