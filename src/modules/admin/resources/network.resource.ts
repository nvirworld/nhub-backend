import { Network } from '@/common/entities/network.entity'
import { ResourceInterface } from '@/modules/admin/resources/resource.interface'
import { Injectable } from '@nestjs/common'
import { ResourceWithOptions } from 'adminjs'

@Injectable()
export class NetworkResource implements ResourceInterface {
  async getResource(): Promise<ResourceWithOptions> {
    return {
      resource: Network,
      options: {
        navigation: {
          name: 'Setting',
          icon: 'Tools'
        },
        listProperties: [
          'id',
          'name',
          'chainId',
          'rpc',
          'scan',
          'currency',
          'iconUrl',
          'createdAt'
        ],
        editProperties: [
          'name',
          'chainId',
          'rpc',
          'scan',
          'currency',
          'iconUrl'
        ],
        sort: {
          sortBy: 'id',
          direction: 'desc'
        }
      }
    }
  }
}
