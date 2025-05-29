import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { LanguageService } from './language.service'
import { CreateLanguageDto, UpdateLanguageDto } from './language.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDto } from 'src/shared/dtos/response.dto'
import { GetLanguagesResDto, GetLanguageParamsDto, GetLanguageResDto } from './language.dto'
import { User } from 'src/shared/decorators/auth.decorators'
@Controller('languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}
  @Get()
  @ZodSerializerDto(GetLanguagesResDto)
  getLanguages() {
    return this.languageService.getLanguages()
  }

  @Get(':id')
  @ZodSerializerDto(GetLanguageResDto)
  getLanguage(@Param() params: GetLanguageParamsDto) {
    return this.languageService.getLanguage(params.languageId)
  }

  @Post()
  createLanguage(@Body() body: CreateLanguageDto, @User('userId') userId: number) {
    return this.languageService.createLanguage({ ...body, createdById: userId })
  }

  @Put(':id')
  updateLanguage(@Param('id') id: string, @Body() body: UpdateLanguageDto, @User('userId') userId: number) {
    return this.languageService.updateLanguage({ id, name: body.name, updatedById: userId })
  }

  @Delete(':id')
  @ZodSerializerDto(MessageResDto)
  deleteLanguage(@Param('id') id: string) {
    return this.languageService.deleteLanguage(id)
  }
}
