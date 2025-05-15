export interface AccessTokenCreatePayload {
  userId: number
  deviceId: number
  roleId: number
  roleName: string
}

export interface AccessTokenPayload extends AccessTokenCreatePayload {
  exp: number
  iat: number
}

export interface RefreshTokenCreatePayload {
  userId: number
}

export interface RefreshTokenPayload extends RefreshTokenCreatePayload {
  exp: number
  iat: number
}
