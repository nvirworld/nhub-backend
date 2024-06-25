import { Admin } from '@/common/entities/admin.entity'
import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  async signIn(email: string, password: string) {
    const admin = await Admin.findOne({
      where: {
        email
      }
    })

    if (admin == null || !bcrypt.compareSync(password, admin.password)) {
      throw new Error('Not correct admin')
    }
    return {
      email
    }
  }
}
