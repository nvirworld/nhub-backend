import { encryptAES, randomSalt } from '@/common/crypto'
import { Deployer } from '@/common/entities/deployer.entity'
import { Inject, Injectable } from '@nestjs/common'
import { Before, ResourceWithOptions, ValidationError } from 'adminjs'
import {
  ResourceInterface,
  ResourceModuleOptions,
  RESOURCE_MODULE_OPTIONS
} from './resource.interface'

@Injectable()
export class DeployerResource implements ResourceInterface {
  constructor(
    @Inject(RESOURCE_MODULE_OPTIONS)
    private readonly resourceModuleOptions: ResourceModuleOptions
  ) {}

  async getResource(): Promise<ResourceWithOptions> {
    return {
      resource: Deployer,
      options: {
        actions: {
          new: {
            before: this.beforeSaveHook
          },
          edit: {
            before: this.beforeSaveHook
          }
        },
        navigation: {
          name: 'Setting',
          icon: 'Tools'
        },
        listProperties: ['id', 'name', 'address', 'encryptedKey', 'createdAt'],
        editProperties: ['name', 'address', 'encryptedKey'],
        sort: {
          sortBy: 'id',
          direction: 'desc'
        }
      }
    }
  }

  beforeSaveHook: Before = (request, context) => {
    const { payload = {}, method } = request
    if (method !== 'post') return request

    const errors: Record<string, { message: string }> = {}

    if (payload.address?.length !== 42) {
      errors.address = {
        message: 'address length is not 42'
      }
    }
    if (
      payload.encryptedKey?.length !== 66 &&
      payload.encryptedKey?.length !== 64
    ) {
      errors.encryptedKey = {
        message: 'encryptedKey length is not 66 or 64'
      }
    }

    // We throw AdminJS ValidationError if there are errors in the payload
    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors)
    }

    const salt = randomSalt(32)
    if (request.method === 'post' && request.payload != null) {
      request.payload.salt = salt
      request.payload.encryptedKey = encryptAES(
        request.payload.encryptedKey,
        salt,
        this.resourceModuleOptions.aesSecretKey
      )
    }
    return request
  }
}
