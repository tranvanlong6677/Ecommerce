import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { LanguageExistsError, LanguageNotFoundError } from './language.error'
import { CreateLanguageSchemaType, LanguageSchemaType, UpdateLanguageSchemaType } from './language.model'
import { isNotFoundPrismaError } from 'src/shared/helpers'

@Injectable()
export class LanguageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createLanguage({ id, name, createdById }: CreateLanguageSchemaType & { createdById: number }) {
    const language = await this.findLanguageUnique({ id })
    if (language) {
      throw LanguageExistsError
    }
    return this.prisma.language.create({
      data: {
        id,
        name,
        createdById,
      },
    })
  }

  async findLanguageUnique(uniqueValue: { id: string }): Promise<LanguageSchemaType | null> {
    return await this.prisma.language.findUnique({
      where: { ...uniqueValue, deletedAt: null },
    })
  }

  async getLanguages() {
    const languages = await this.prisma.language.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      data: languages,
      totalItems: languages.length,
    }
  }

  async updateLanguage({
    id,
    name,
    updatedById,
  }: UpdateLanguageSchemaType & { id: string; updatedById: number }): Promise<LanguageSchemaType> {
    const language = await this.findLanguageUnique({ id })
    if (!language) {
      throw LanguageNotFoundError
    }
    try {
      const language = await this.prisma.language.update({
        where: { id },
        data: { name, updatedById },
      })
      return language
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw LanguageNotFoundError
      }
      throw error
    }
  }

  async deleteLanguage(id: string, isHard: boolean = false) {
    const language = await this.findLanguageUnique({ id })
    if (!language) {
      throw LanguageNotFoundError
    }

    if (isHard) {
      await this.prisma.language.delete({
        where: { id },
      })
    } else {
      await this.prisma.language.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
    }

    return {
      message: 'Ngôn ngữ đã được xóa thành công',
    }
  }
}
