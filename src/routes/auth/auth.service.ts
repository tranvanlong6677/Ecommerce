import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TokenService } from 'src/shared/services/token.service'
import { isNotFoundPrismaError, isUniqueContraintPrismaError } from 'src/shared/helpers'
import { RoleService } from './roles.service'
import { RegisterBodyType } from './auth.model'
import { AuthRepository } from './auth.repo'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly roleService: RoleService,
    private readonly authRepository: AuthRepository,
  ) {}

  async register(body: RegisterBodyType) {
    try {
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

  // async login(body: any) {
  //   const user = await this.prismaService.user.findUnique({
  //     where: {
  //       email: body.email,
  //     },
  //   })
  //   if (!user) {
  //     throw new UnauthorizedException('Account is not exist')
  //   }
  //   const isPasswordMatch = await this.hashingService.compare(body.password, user.password)
  //   if (!isPasswordMatch) {
  //     throw new UnprocessableEntityException([{ field: 'password', error: 'Password is incorrect' }])
  //   }
  //   const tokens = await this.generateTokens({ userId: user.id })
  //   return tokens
  // }

  // async generateTokens(payload: { userId: number }) {
  //   const [accessToken, refreshToken] = await Promise.all([
  //     this.tokenService.signAccessToken(payload),
  //     this.tokenService.signRefreshToken(payload),
  //   ])

  //   const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
  //   await this.prismaService.refreshToken.create({
  //     data: {
  //       token: refreshToken,
  //       userId: decodedRefreshToken.userId,
  //       expiresAt: new Date(decodedRefreshToken.exp * 1000),
  //     },
  //   })
  //   return { accessToken, refreshToken }
  // }

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
