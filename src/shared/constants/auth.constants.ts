export const REQUEST_USER_KEY = 'user'
export const AuthType = {
  BEARER: 'Bearer',
  NONE: 'None',
  API_KEY: 'ApiKey',
} as const

export type AuthTypeType = (typeof AuthType)[keyof typeof AuthType]

export const ConditionGuard = {
  AND: 'and',
  OR: 'or',
}

export type ConditionGuardType = (typeof ConditionGuard)[keyof typeof ConditionGuard]
