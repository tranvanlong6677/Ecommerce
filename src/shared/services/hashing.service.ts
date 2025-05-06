import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

const saltRounds = 10

@Injectable()
export class HashingService {
  async hashPassword(value: string) {
    return await bcrypt.hash(value, saltRounds)
  }

  compare(value: string, hash: string) {
    return bcrypt.compare(value, hash)
  }
}
