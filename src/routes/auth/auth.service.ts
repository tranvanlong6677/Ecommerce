import {
  ConflictException,
  HttpException,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { HashingService } from 'src/shared/services/hashing.service'
import { TokenService } from 'src/shared/services/token.service'
import { generateOtp, isNotFoundPrismaError, isUniqueContraintPrismaError } from 'src/shared/helpers'
import { RoleService } from './roles.service'
import { LoginBodyType, LogoutBodyType, RefreshTokenBodyType, RegisterBodyType, SendOTPBodyType } from './auth.model'
import { AuthRepository } from './auth.repo'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { addMilliseconds } from 'date-fns'
import envConfig from 'src/shared/config'
import ms from 'ms'
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constants'
import { EmailService } from 'src/shared/services/email.service'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
    private readonly roleService: RoleService,
    private readonly authRepository: AuthRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
  ) {}

  async register(body: RegisterBodyType) {
    try {
      const verificationCode = await this.authRepository.findUniqueVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeOfVerificationCode.REGISTER,
      })
      if (!verificationCode) {
        throw new UnprocessableEntityException([{ message: 'Mã OTP không hợp lệ', path: 'code' }])
      }

      if (verificationCode.expiresAt < new Date()) {
        throw new UnprocessableEntityException([{ message: 'Mã OTP đã hết hạn', path: 'code' }])
      }
      const clientRoleId = await this.roleService.getClientRoleId()
      const hashedPassword = await this.hashingService.hashPassword(body.password)

      return await this.authRepository.createUser({
        name: body.name,
        password: hashedPassword,
        email: body.email,
        roleId: clientRoleId,
        phoneNumber: body.phoneNumber,
      })
    } catch (error) {
      if (isUniqueContraintPrismaError(error)) {
        console.log(error)
        throw new ConflictException('Email already exists')
      }

      console.log('>>> Register error: ', error)
      throw error
    }
  }

  async sendOtp(body: SendOTPBodyType) {
    // 1:Kiểm tra email đã tồn tại hay chưa
    const user = await this.sharedUserRepository.findUnique({ email: body.email })
    if (!!user) {
      throw new UnprocessableEntityException([
        {
          path: 'email',
          message: 'Email đã tồn tại',
        },
      ])
    }
    // 2:Tạo mã OTP
    const code = generateOtp()
    const VerificationCode = await this.authRepository.createVerificationCode({
      email: body.email,
      type: body.type,
      code: code + '',
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)),
    })
    // 3: Gửi mã OTP
    await this.emailService.sendEmailOTP({ code, email: body.email })

    return VerificationCode
  }

  async login(
    body: LoginBodyType & {
      userAgent: string
      ip: string
    },
  ) {
    const user = await this.authRepository.findUniqueUserIncludeRole({ email: body.email })

    if (!user) {
      throw new UnprocessableEntityException([
        {
          path: 'email',
          message: 'Email đã tồn tại',
        },
      ])
    }
    const isPasswordMatch = await this.hashingService.compare(body.password, user.password)
    if (!isPasswordMatch) {
      throw new UnprocessableEntityException([{ field: 'password', error: 'Password is incorrect' }])
    }

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
        throw new UnauthorizedException('Refresh token expired')
      }

      const user = await this.authRepository.findUniqueUserIncludeRole({
        id: decodedRefreshToken.userId,
      })

      if (!user) {
        throw new UnauthorizedException('Refresh token is not valid')
      }

      // 2:Kiểm tra refresh token có trong database hay không
      const refreshTokenInDb = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
        token: refreshToken,
      })
      if (!refreshTokenInDb) {
        throw new UnauthorizedException('Refresh token has been revoked')
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
      throw new UnauthorizedException()
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
        throw new UnauthorizedException('Refresh token has been revoke')
      }
      throw new UnauthorizedException()
    }
  }
}
