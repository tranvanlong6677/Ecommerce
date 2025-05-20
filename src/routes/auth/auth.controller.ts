import { Body, Controller, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import {
  LoginBodyDto,
  LoginResDto,
  LogoutBodyDto,
  RefreshTokenBodyDto,
  RefreshTokenResDto,
  RegisterBodyDto,
  RegisterResDto,
  SendOTPBodyDto,
} from './dto/auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { IsPublic, UserAgent } from 'src/shared/decorators/auth.decorators'
import { MessageResDto } from 'src/shared/dtos/response.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
