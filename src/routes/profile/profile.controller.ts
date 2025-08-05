import { Body, Controller, Get, Put } from '@nestjs/common'
import { User } from 'src/shared/decorators/auth.decorators'
import { ProfileService } from './profile.service'
import { MessageResDto } from 'src/shared/dtos/response.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ChangePasswordBodyDto, UpdateProfileBodyDto } from './profile.dto'
import { GetProfileResDto, UpdateProfileResDto } from 'src/shared/dtos/shared-user.dto'

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ZodSerializerDto(GetProfileResDto)
  getProfile(@User('userId') userId: number) {
    return this.profileService.getProfile(userId)
  }

  @Put('/update')
  @ZodSerializerDto(UpdateProfileResDto)
  updateProfile(@User('userId') userId: number, @Body() data: UpdateProfileBodyDto) {
    return this.profileService.updateProfile(userId, data)
  }

  @Put('/change-password')
  @ZodSerializerDto(MessageResDto)
  changePassword(@User('userId') userId: number, @Body() data: ChangePasswordBodyDto) {
    return this.profileService.changePassword(userId, data)
  }
}
