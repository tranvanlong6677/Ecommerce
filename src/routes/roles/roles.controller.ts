import { Controller, Get, Post, Body, Param, Delete, Query, Put } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { RolesService } from './roles.service'

import {
  CreateRoleBodyDto,
  CreateRoleResDto,
  GetRoleQueryDto,
  GetRoleResDto,
  GetRolesQueryDto,
  GetRolesResDto,
  UpdateRoleBodyDto,
  UpdateRoleResDto,
} from './roles.dto'
import { User } from 'src/shared/decorators/auth.decorators'
import { MessageResDto } from 'src/shared/dtos/response.dto'

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ZodSerializerDto(GetRolesResDto)
  async findAll(@Query() query: GetRolesQueryDto) {
    return this.rolesService.findAll(query)
  }

  @Get(':id')
  @ZodSerializerDto(GetRoleResDto)
  findOne(@Param() params: GetRoleQueryDto) {
    return this.rolesService.findOne(params)
  }

  @Post()
  @ZodSerializerDto(CreateRoleResDto)
  create(@Body() body: CreateRoleBodyDto, @User('userId') userId: number) {
    return this.rolesService.create({ data: body, userId })
  }

  @Put(':roleId')
  @ZodSerializerDto(UpdateRoleResDto)
  update(@Param('roleId') roleId: string, @Body() body: UpdateRoleBodyDto, @User('userId') userId: number) {
    return this.rolesService.update({ roleId: +roleId, data: body, userId })
  }

  @Delete(':roleId')
  @ZodSerializerDto(MessageResDto)
  remove(@Param('roleId') roleId: string, @User('userId') userId: number) {
    return this.rolesService.remove({ roleId: +roleId, userId })
  }
}
