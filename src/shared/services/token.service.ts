import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import envConfig from '../config'
import {
  AccessTokenCreatePayload,
  RefreshTokenCreatePayload,
  AccessTokenPayload,
  RefreshTokenPayload,
} from '../types/jwt.types'

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  signAccessToken(payload: AccessTokenCreatePayload) {
    return this.jwtService.sign(payload, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
      expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN,
      algorithm: 'HS256',
    })
  }

  signRefreshToken(payload: RefreshTokenCreatePayload) {
    return this.jwtService.sign(payload, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
      expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN,
      algorithm: 'HS256',
    })
  }

  verifyAccessToken(accessToken: string): Promise<AccessTokenPayload> {
    return this.jwtService.verifyAsync(accessToken, {
      secret: envConfig.ACCESS_TOKEN_SECRET,
    })
  }

  verifyRefreshToken(refreshToken: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verifyAsync(refreshToken, {
      secret: envConfig.REFRESH_TOKEN_SECRET,
    })
  }
}
