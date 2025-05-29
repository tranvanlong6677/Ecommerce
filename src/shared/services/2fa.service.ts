import { Injectable } from '@nestjs/common'
import * as OTPAuth from 'otpauth'
import envConfig from '../config'

@Injectable()
export class TwoFactorAuthService {
  private createTOTP(email: string, secret?: string) {
    return new OTPAuth.TOTP({
      issuer: envConfig.APP_NAME,
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret || new OTPAuth.Secret(),
    })
  }

  generateTOTPSecret(email: string) {
    const totp = this.createTOTP(email)
    return { secret: totp.secret.base32, uri: totp.toString() }
  }

  verifyTOTP({ email, token, secret }: { email: string; token: string; secret?: string }) {
    const totp = this.createTOTP(email, secret)
    const delta = totp.validate({ token, window: 1 })
    return delta !== null
  }
}
