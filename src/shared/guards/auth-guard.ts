import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AUTH_TYPE_KEY, AuthTypeDecoratorPayload } from '../decorators/auth.decorators'
import { AccessTokenGuard } from './access-token-guard'
import { APIKeyGuard } from './api-key-guard'
import { AuthType, ConditionGuard } from '../constants/auth.constants'

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
    const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? {
      authTypes: [AuthType.NONE],
      options: {
        condition: ConditionGuard.AND,
      },
    }

    const guards = authTypeValue.authTypes.map((item) => {
      return this.authTypeGuardMap[item]
    })

    let error = new UnauthorizedException()
    if (!authTypeValue.options?.condition) {
      const canActivate = await guards[0].canActivate(context)
      if (canActivate) {
        return true
      }
      return false
    }

    if (!!authTypeValue.options?.condition && authTypeValue.options.condition === ConditionGuard.OR) {
      for (const guard of guards) {
        const canActivate = await Promise.resolve(guard.canActivate(context)).catch((err) => {
          error = err
          return false
        })
        if (canActivate) {
          return true
        }
      }
      throw error
    }

    if (!!authTypeValue.options?.condition && authTypeValue.options?.condition === ConditionGuard.AND) {
      for (const guard of guards) {
        const canActivate = await Promise.resolve(guard.canActivate(context)).catch((err) => {
          error = err
          return false
        })
        if (!canActivate) {
          throw error
        }
      }

      return true
    }
    return true
  }
}
