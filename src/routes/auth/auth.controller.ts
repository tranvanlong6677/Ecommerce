import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post, Query, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import {
  ChangePasswordBodyDto,
  DisableTwoFactorBodyDto,
  ForgotPasswordBodyDto,
  GetAuthorizationUrlResDto,
  LoginBodyDto,
  LoginResDto,
  LogoutBodyDto,
  RefreshTokenBodyDto,
  RefreshTokenResDto,
  RegisterBodyDto,
  RegisterResDto,
  SendOTPBodyDto,
  TwoFactorSetupResDto,
} from './dto/auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { IsPublic, User, UserAgent } from 'src/shared/decorators/auth.decorators'
import { MessageResDto } from 'src/shared/dtos/response.dto'
import { GoogleService } from './google.service'
import { Response } from 'express'
import envConfig from 'src/shared/config'
import { EmptyBodyDto } from 'src/shared/dtos/request.dto'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @Post('/register')
  @IsPublic()
  @ZodSerializerDto(RegisterResDto)
  register(@Body() body: RegisterBodyDto) {
    return this.authService.register(body)
  }

  @Post('/otp')
  @IsPublic()
  @ZodSerializerDto(MessageResDto)
  sendOtp(@Body() body: SendOTPBodyDto) {
    return this.authService.sendOtp(body)
  }

  @Post('/login')
  @IsPublic()
  @ZodSerializerDto(LoginResDto)
  login(@Body() body: LoginBodyDto, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.login({ ...body, userAgent, ip })
  }

  @Post('/refresh-token')
  @IsPublic()
  @ZodSerializerDto(RefreshTokenResDto)
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() body: RefreshTokenBodyDto, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.refreshToken({ ...body, userAgent, ip })
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(MessageResDto)
  logout(@Body() body: LogoutBodyDto) {
    return this.authService.logout(body)
  }

  @Get('/google-link')
  @IsPublic()
  @ZodSerializerDto(GetAuthorizationUrlResDto)
  getGoogleLink(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationUrl({ userAgent, ip })
  }

  @Get('/google/callback')
  @IsPublic()
  async googleCallback(@Query('state') state: string, @Query('code') code: string, @Res() res: Response) {
    try {
      const data = await this.googleService.googleCallback({ state, code })
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URL}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi đăng nhập bằng Google, vui lòng thử lại bằng cách khác'
      return res.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URL}?errorMessage=${message}`)
    }
  }

  @Post('/forgot-password')
  @IsPublic()
  @ZodSerializerDto(MessageResDto)
  forgotPassword(@Body() body: ForgotPasswordBodyDto) {
    return this.authService.forgotPassword(body)
  }

  // Dùng Post mặc dù body rỗng, vì post mang ý nghĩa là tạo ra cái gì đó, và post cũng bảo mật hơn get
  // vì get sẽ hiển thị khi gọi link trên trình duyệt
  @Post('/2fa/setup')
  @ZodSerializerDto(TwoFactorSetupResDto)
  setupTwoFactorAuth(@Body() _: EmptyBodyDto, @User('userId') id: number) {
    return this.authService.setupTwoFactorAuth(id)
  }

  @Post('/2fa/disable')
  @ZodSerializerDto(MessageResDto)
  disableTwoFactorAuth(@Body() body: DisableTwoFactorBodyDto, @User('userId') id: number) {
    return this.authService.disableTwoFactorAuth({
      ...body,
      userId: id,
    })
  }
}
