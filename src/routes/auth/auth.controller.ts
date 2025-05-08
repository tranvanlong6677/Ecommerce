import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @UseInterceptors(ClassSerializerInterceptor)
  // @SerializeOptions({ type: any })
  @Post('/register')
  async register(@Body() body: any) {
    return await this.authService.register(body)
  }
}
