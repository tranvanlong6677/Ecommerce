import { Body, Controller, Ip, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginBodyDto, RegisterBodyDto, RegisterResDto, SendOTPBodyDto } from './dto/auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserAgent } from 'src/shared/decorators/auth.decorators'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @ZodSerializerDto(RegisterResDto)
  async register(@Body() body: RegisterBodyDto) {
    return await this.authService.register(body)
  }

  @Post('/otp')
  async sendOtp(@Body() body: SendOTPBodyDto) {
    return await this.authService.sendOtp(body)
  }

  @Post('/login')
  async login(@Body() body: LoginBodyDto, @UserAgent() userAgent: string, @Ip() ip: string) {
    return await this.authService.login({ ...body, userAgent, ip })
  }
}
