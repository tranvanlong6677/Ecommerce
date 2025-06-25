import { Module } from '@nestjs/common'
import { RolesService } from './roles.service'
import { RolesController } from './roles.controller'
import { RolesRepository } from './roles.repo'

@Module({
  controllers: [RolesController],
  providers: [RolesService, RolesRepository],
})
export class RolesModule {}
