import { Injectable } from '@nestjs/common'
import { LanguageRepository } from './language.repo'
import { CreateLanguageSchemaType, UpdateLanguageSchemaType } from './language.model'

@Injectable()
export class LanguageService {
  constructor(private readonly languageRepository: LanguageRepository) {}

  async getLanguages() {
    return this.languageRepository.getLanguages()
  }

  async getLanguage(id: string) {
    return this.languageRepository.findLanguageUnique({ id })
  }

  async createLanguage({ id, name, createdById }: CreateLanguageSchemaType & { createdById: number }) {
    return this.languageRepository.createLanguage({ id, name, createdById })
  }

  async updateLanguage({ id, name, updatedById }: UpdateLanguageSchemaType & { id: string; updatedById: number }) {
    return this.languageRepository.updateLanguage({ id, name, updatedById })
  }

  async deleteLanguage(id: string, isHard: boolean = false) {
    return this.languageRepository.deleteLanguage(id, isHard)
  }
}
