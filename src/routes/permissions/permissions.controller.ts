import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreatePermissionDto,
  GetPermissionParamsDto,
  GetPermissionResDto,
  GetPermissionsQueryDTO,
  GetPermissionsResDto,
  UpdatePermissionDto,
} from './permissions.dto'
import { PermissionsService } from './permissions.service'
import { User } from 'src/shared/decorators/auth.decorators'
import { MessageResDto } from 'src/shared/dtos/response.dto'

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPermissionDto: CreatePermissionDto, @User('userId') userId: number) {
    return this.permissionsService.create({
      createPermissionDto,
      createdById: userId,
    })
  }

  @Get()
  @ZodSerializerDto(GetPermissionsResDto)
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: GetPermissionsQueryDTO) {
    return this.permissionsService.findAll(query)
  }

  @Get(':permissionId')
  @HttpCode(HttpStatus.OK)
  findOne(@Param() params: GetPermissionParamsDto) {
    return this.permissionsService.findOne({ permissionId: params.permissionId })
  }

  @Put(':id')
  @ZodSerializerDto(GetPermissionResDto)
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto, @User('userId') userId: number) {
    return this.permissionsService.update({ id: +id, permission: updatePermissionDto, updatedById: userId })
  }

  @Delete(':permissionId')
  @ZodSerializerDto(MessageResDto)
  delete(@Param('permissionId') permissionId: string, @User('userId') userId: number) {
    return this.permissionsService.delete({
      id: +permissionId,
      deletedById: userId,
      isHard: false,
    })
  }
}
