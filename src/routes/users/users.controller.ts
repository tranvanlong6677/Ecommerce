import { Controller, Get, Post, Body, Param, Delete, Query, Put } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto, GetUserResDto, GetUsersQueryDTO, GetUsersResDto, UpdateUserDto } from './users.dto'
import { User } from 'src/shared/decorators/auth.decorators'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDto } from 'src/shared/dtos/response.dto'
import { AccessTokenCreatePayload } from 'src/shared/types/jwt.types'
import { ActiveUser } from 'src/shared/decorators/active-user.decorators'
import { RoleName } from 'src/shared/constants/role.constant'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ZodSerializerDto(GetUserResDto)
  create(
    @Body() createUserDto: CreateUserDto,
    @User() user: AccessTokenCreatePayload,
    @ActiveUser('name') roleName: (typeof RoleName)[keyof typeof RoleName],
  ) {
    return this.usersService.create({
      data: createUserDto,
      createdUser: user,
      createdByRoleName: roleName,
    })
  }

  @Get()
  @ZodSerializerDto(GetUsersResDto)
  findAll(@Query() query: GetUsersQueryDTO) {
    return this.usersService.findAll(query)
  }

  @Get(':id')
  @ZodSerializerDto(GetUserResDto)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id)
  }

  @Put(':id')
  @ZodSerializerDto(GetUserResDto)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: AccessTokenCreatePayload,
    @ActiveUser('name') roleName: (typeof RoleName)[keyof typeof RoleName],
  ) {
    return this.usersService.update(+id, updateUserDto, user?.userId, roleName)
  }

  @Delete(':id')
  @ZodSerializerDto(MessageResDto)
  remove(
    @Param('id') id: string,
    @User() user: AccessTokenCreatePayload,
    @ActiveUser('name') roleName: (typeof RoleName)[keyof typeof RoleName],
  ) {
    return this.usersService.remove(+id, user?.userId, roleName)
  }
}
