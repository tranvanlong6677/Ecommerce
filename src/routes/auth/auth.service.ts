import { ConflictException, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { HashingService } from 'src/shared/services/hashing.service'
import { TokenService } from 'src/shared/services/token.service'
import { generateOtp, isUniqueContraintPrismaError } from 'src/shared/helpers'
import { RoleService } from './roles.service'
import { LoginBodyType, RegisterBodyType, SendOTPBodyType } from './auth.model'
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

  // async refreshToken(refreshToken: string) {
  //   try {
  //     const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
  //     if (decodedRefreshToken.exp < Date.now() / 1000) {
  //       throw new UnauthorizedException('Refresh token expired')
  //     }

  //     const user = await this.prismaService.user.findUnique({
  //       where: {
  //         id: decodedRefreshToken.userId,
  //       },
  //     })

  //     if (!user) {
  //       throw new UnauthorizedException('Refresh token is not valid')
  //     }

  //     const checkExistRefreshToken = await this.prismaService.refreshToken.findUnique({
  //       where: {
  //         token: refreshToken,
  //       },
  //     })

  //     if (!checkExistRefreshToken) {
  //       throw new UnauthorizedException('Refresh token has been revoked')
  //     }

  //     const tokens = await this.generateTokens({ userId: decodedRefreshToken.userId })
  //     await this.prismaService.refreshToken.delete({
  //       where: {
  //         token: refreshToken,
  //       },
  //     })

  //     // await this.prismaService.$transaction([
  //     //   this.prismaService.refreshToken.deleteMany({
  //     //     where: {
  //     //       token: refreshToken,
  //     //     },
  //     //   }),
  //     //   this.prismaService.refreshToken.create({
  //     //     data: {
  //     //       token: tokens.refreshToken,
  //     //       userId: decodedRefreshToken.userId,
  //     //       expiresAt: new Date(decodedRefreshToken.exp * 1000),
  //     //     },
  //     //   }),
  //     // ])

  //     return tokens
  //   } catch (error) {
  //     if (isNotFoundPrismaError(error)) {
  //       throw new UnauthorizedException('Refresh token has been revoked')
  //     }
  //     throw new UnauthorizedException()
  //   }
  // }

  // async logout(refreshToken: string) {
  //   try {
  //     // Kiểm tra refresh token có hợp lệ hay không
  //     await this.tokenService.verifyRefreshToken(refreshToken)

  //     // Xóa refresh token trong DB
  //     await this.prismaService.refreshToken.delete({
  //       where: {
  //         token: refreshToken,
  //       },
  //     })

  //     return {
  //       message: 'Logout successfully',
  //     }
  //   } catch (error) {
  //     if (isNotFoundPrismaError(error)) {
  //       throw new UnauthorizedException('Refresh token has been revoke')
  //     }
  //     throw new UnauthorizedException()
  //   }
  // }
}
