import { Admin } from '@/common/entities/admin.entity'
import { ResourceInterface } from '@/modules/admin/resources/resource.interface'
import hashPassword from '@adminjs/passwords'
import { Injectable } from '@nestjs/common'
import { ResourceWithOptions } from 'adminjs'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AdminResource implements ResourceInterface {
  async getResource(): Promise<ResourceWithOptions> {
    return {
      resource: Admin,
      options: {
        navigation: {
          name: 'Setting',
          icon: 'Tools'
        },
        listProperties: ['id', 'email', 'name', 'createdAt'],
        editProperties: ['email', 'name', 'password'],
        sort: {
          sortBy: 'id',
          direction: 'desc'
        }
      },
      features: [
        hashPassword({
          properties: {
            encryptedPassword: 'password',
            password: 'password'
          },
          hash: password => bcrypt.hashSync(password, 10)
        })
      ]
    }
  }
}
