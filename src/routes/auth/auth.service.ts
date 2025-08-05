import { HttpException, Injectable } from '@nestjs/common'
import { HashingService } from 'src/shared/services/hashing.service'
import { TokenService } from 'src/shared/services/token.service'
import { generateOtp, isNotFoundPrismaError, isUniqueContraintPrismaError } from 'src/shared/helpers'
import {
  DisableTwoFactorBodyType,
  ForgotPasswordBodyType,
  LoginBodyType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType,
} from './auth.model'
import { AuthRepository } from './auth.repo'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { addMilliseconds } from 'date-fns'
import envConfig from 'src/shared/config'
import ms from 'ms'
import { TypeOfVerificationCode, TypeOfVerificationCodeType } from 'src/shared/constants/auth.constants'
import { EmailService } from 'src/shared/services/email.service'
import {
  EmailAlreadyExistsException,
  EmailOrPasswordNotTrueException,
  InvalidEmailException,
  InvalidOTPException,
  InvalidRefreshTokenException,
  OTPExpiredException,
  PasswordNotTrueException,
  RefreshTokenExpiredException,
  TOTPAlreadySetupException,
  TOTPInvalidException,
  TOTPNotSetupException,
  UnauthorizedExceptionCustom,
  UserNotFoundException,
} from './auth.error'
import { TwoFactorAuthService } from 'src/shared/services/2fa.service'
import { SharedRoleRepository } from 'src/shared/repositories/shared-role.repo'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly sharedRoleRepository: SharedRoleRepository,
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  async register(body: RegisterBodyType) {
    try {
      await this.validateVerificationCode({
        code: body.code,
        type: TypeOfVerificationCode.REGISTER,
        email: body.email,
      })
      const clientRoleId = await this.sharedRoleRepository.getClientRoleId()
      const hashedPassword = await this.hashingService.hashPassword(body.password)
      const [user] = await Promise.all([
        await this.authRepository.createUser({
          name: body.name,
          password: hashedPassword,
          email: body.email,
          roleId: clientRoleId,
          phoneNumber: body.phoneNumber,
        }),
        await this.authRepository.deleteVerificationCode({
          email_code_type: {
            email: body.email,
            type: TypeOfVerificationCode.REGISTER,
            code: body.code,
          },
        }),
      ])
      return user
    } catch (error) {
      if (isUniqueContraintPrismaError(error)) {
        console.log(error)
        throw EmailAlreadyExistsException
      }

      console.log('>>> Register error: ', error)
      throw error
    }
  }

  async sendOtp(body: SendOTPBodyType) {
    // 1:Kiểm tra email đã tồn tại hay chưa
    const user = await this.sharedUserRepository.findUnique({ email: body.email, deletedAt: null })
    if (body.type === TypeOfVerificationCode.REGISTER && user) {
      throw EmailAlreadyExistsException
    }
    if (body.type === TypeOfVerificationCode.FORGOT_PASSWORD && !user) {
      throw InvalidEmailException
    }
    // 2:Tạo mã OTP
    const code = generateOtp()
    await this.authRepository.createVerificationCode({
      email: body.email,
      type: body.type,
      code: code + '',
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN) as number),
    })
    // 3: Gửi mã OTP
    await this.emailService.sendEmailOTP({ code, email: body.email })

    return {
      message: 'Send OTP successfully',
    }
  }

  async login(
    body: LoginBodyType & {
      userAgent: string
      ip: string
    },
  ) {
    // 1: Kiểm tra email có tồn tại trong DB hay không,Mật khẩu có đúng hay không
    const user = await this.authRepository.findUniqueUserIncludeRole({ email: body.email, deletedAt: null })

    if (!user) {
      throw EmailOrPasswordNotTrueException
    }
    const isPasswordMatch = await this.hashingService.compare(body.password, user.password)
    if (!isPasswordMatch) {
      throw PasswordNotTrueException
    }

    // 2:Nếu User đã bật mã 2FA thì kiểm tra mã 2FA TOTP Code hoặc OTP code(email)
    if (user.totpSecret) {
      // Nết không có TOTP code và OTP code thì throw lỗi
      if (!body.totpCode && !body.code) {
        throw TOTPInvalidException
      }

      // Nếu có TOTP code thì kiểm tra TOTP code
      if (body.totpCode) {
        const isValid = this.twoFactorAuthService.verifyTOTP({
          email: user.email,
          token: body.totpCode,
          secret: user.totpSecret,
        })

        if (!isValid) {
          throw TOTPInvalidException
        }
      }

      // Nếu có OTP code thì kiểm tra OTP code
      if (body.code) {
        await this.validateVerificationCode({
          code: body.code,
          type: TypeOfVerificationCode.LOGIN,
          email: user.email,
        })
      }
    }

    // 3: Tạo device và tạo token
    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    })

    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    })
    return tokens
  }

  async generateTokens(payload: { userId: number; deviceId: number; roleId: number; roleName: string }) {
    const { userId, deviceId, roleId, roleName } = payload
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        deviceId,
        roleId,
        roleName,
      }),
      this.tokenService.signRefreshToken(payload),
    ])

    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: decodedRefreshToken.userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId,
    })

    return { accessToken, refreshToken }
  }

  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      // 1: Kiểm tra xem refresh token có hợp lệ không ( đã hết hạn chưa, có User nào dùng refresh token này không)
      const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
      if (decodedRefreshToken.exp < Date.now() / 1000) {
        throw RefreshTokenExpiredException
      }

      const user = await this.authRepository.findUniqueUserIncludeRole({
        id: decodedRefreshToken.userId,
        deletedAt: null,
      })

      if (!user) {
        throw InvalidRefreshTokenException
      }

      // 2:Kiểm tra refresh token có trong database hay không
      const refreshTokenInDb = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
        token: refreshToken,
      })
      if (!refreshTokenInDb) {
        throw RefreshTokenExpiredException
      }
      // 3: Update device
      const {
        deviceId,
        user: {
          id: userId,
          roleId,
          role: { name: roleName },
        },
      } = refreshTokenInDb
      const $updateDevice = this.authRepository.updateDevice({ deviceId, data: { ip, userAgent } })

      // 4: Xóa RT cũ
      const $deleteRefreshToken = this.authRepository.deleteRefreshToken(refreshToken)

      // 5: Tạo token mới
      const $tokens = this.generateTokens({
        userId,
        roleId,
        roleName,
        deviceId,
      })

      const [, , tokens] = await Promise.all([$updateDevice, $deleteRefreshToken, $tokens])

      return tokens
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw UnauthorizedExceptionCustom
    }
  }

  async logout({ refreshToken }: LogoutBodyType) {
    try {
      // Kiểm tra refresh token có hợp lệ hay không
      await this.tokenService.verifyRefreshToken(refreshToken)

      // Xóa refresh token trong DB
      const deletedToken = await this.authRepository.deleteRefreshToken(refreshToken)

      // Cập nhật device đã logout
      await this.authRepository.updateDevice({
        deviceId: deletedToken.deviceId,
        data: {
          isActive: false,
        },
      })

      return {
        message: 'Logout successfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw RefreshTokenExpiredException
      }
      throw UnauthorizedExceptionCustom
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    // 1: Kiểm tra email có tồn tại trong DB hay không
    const user = await this.authRepository.findUniqueUserIncludeRole({ email: body.email, deletedAt: null })
    if (!user) {
      throw InvalidEmailException
    }

    // 2:Kiểm tra xem mã OTP có hợp lệ hay không
    await this.validateVerificationCode({
      code: body.code,
      type: TypeOfVerificationCode.FORGOT_PASSWORD,
      email: body.email,
    })
    // 3:Cập nhật password và xóa OTP
    const hashedPassword = await this.hashingService.hashPassword(body.password)
    await Promise.all([
      await this.authRepository.updateUser(
        { id: user?.id },
        {
          password: hashedPassword,
        },
      ),

      await this.authRepository.deleteVerificationCode({
        email_code_type: {
          email: body.email,
          type: TypeOfVerificationCode.FORGOT_PASSWORD,
          code: body.code,
        },
      }),
    ])

    return {
      message: 'Password updated successfully',
    }
  }

  async validateVerificationCode({
    code,
    type,
    email,
  }: {
    code: string
    type: TypeOfVerificationCodeType
    email: string
  }) {
    const user = await this.authRepository.findUniqueUserIncludeRole({ email, deletedAt: null })
    if (!user && type !== TypeOfVerificationCode.REGISTER) {
      throw InvalidEmailException
    }

    const verificationCode = await this.authRepository.findUniqueVerificationCode({
      email_code_type: {
        email,
        type,
        code,
      },
    })
    if (!verificationCode) {
      throw InvalidOTPException
    }

    if (code !== verificationCode.code) {
      throw InvalidOTPException
    }

    if (verificationCode.expiresAt < new Date()) {
      throw OTPExpiredException
    }

    return verificationCode
  }

  async setupTwoFactorAuth(userId: number) {
    // 1: Kiểm tra xem user có tồn tại trong DB hay không, xem user đã có 2FA hay chưa
    const user = await this.sharedUserRepository.findUnique({ id: userId, deletedAt: null })
    if (!user) {
      throw UserNotFoundException
    }
    if (user.totpSecret) {
      throw TOTPAlreadySetupException
    }
    // 2: Tạo ra secret và uri
    const { secret, uri } = this.twoFactorAuthService.generateTOTPSecret(user.email)
    // 3: Cập nhật secret vào DB
    await this.authRepository.updateUser({ id: userId }, { totpSecret: secret })
    // 4: Trả về uri và secret
    return {
      uri,
      secret,
    }
  }

  async disableTwoFactorAuth(data: DisableTwoFactorBodyType & { userId: number }) {
    const { userId, totpCode, code } = data
    // 1: Kiểm tra xem user có bật 2FA hay không
    const user = await this.sharedUserRepository.findUnique({ id: userId, deletedAt: null })
    if (!user) {
      throw UserNotFoundException
    }
    if (!user.totpSecret) {
      throw TOTPNotSetupException
    }

    // 2: Kiểm tra mã 2FA TOTP Code hoặc OTP code(email)
    if (totpCode) {
      const isValid = this.twoFactorAuthService.verifyTOTP({
        email: user.email,
        token: totpCode,
        secret: user.totpSecret,
      })
      if (!isValid) {
        throw TOTPInvalidException
      }
    }

    if (code) {
      await this.validateVerificationCode({
        code,
        type: TypeOfVerificationCode.DISABLE_2FA,
        email: user.email,
      })
    }

    // 3: Xóa secret khỏi DB
    await this.authRepository.updateUser({ id: userId }, { totpSecret: null })
    // 4:Trả về message
    return {
      message: 'Two-factor authentication disabled successfully',
    }
  }
}
