import { ConflictException, Injectable } from '@nestjs/common'
import { PermissionsRepository } from './permissions.repo'
import {
  CreatePermissionType,
  GetPermissionParamsType,
  GetPermissionsQueryType,
  UpdatePermissionType,
} from './permissions.model'
import { isNotFoundPrismaError, isUniqueContraintPrismaError } from 'src/shared/helpers'
import { NotFoundRecordException } from 'src/shared/error'
import { PermissionAlreadyExistsException } from './permission.error'

@Injectable()
export class PermissionsService {
  constructor(private readonly permissionsRepository: PermissionsRepository) {}
  async create({
    createdById,
    createPermissionDto,
  }: {
    createdById: number | null
    createPermissionDto: CreatePermissionType
  }) {
    try {
      return await this.permissionsRepository.createPermission({
        createdById,
        permission: createPermissionDto,
      })
    } catch (error) {
      if (isUniqueContraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }
      throw error
    }
  }

  async findAll(pagination: GetPermissionsQueryType) {
    return await this.permissionsRepository.findAllPermissions(pagination)
  }

  async findOne({ permissionId }: GetPermissionParamsType) {
    const permission = await this.permissionsRepository.findUnique({ id: permissionId })
    if (!permission) {
      throw NotFoundRecordException
    }
    return permission
  }

  async update({ id, permission, updatedById }: { id: number; permission: UpdatePermissionType; updatedById: number }) {
    try {
      return await this.permissionsRepository.updatePermission({ id, permission, updatedById })
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      if (isUniqueContraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById, isHard }: { id: number; deletedById: number; isHard: boolean }) {
    try {
      await this.permissionsRepository.deletePermission({
        id,
        deletedById,
        isHard,
      })
      return {
        message: 'Delete successfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
