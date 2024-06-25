import { Nft721 } from '@/common/entities/nft-721.entity'
import { Components } from '@/modules/admin/components'
import { ResourceInterface } from '@/modules/admin/resources/resource.interface'
import { Injectable } from '@nestjs/common'
import { ResourceWithOptions } from 'adminjs'

@Injectable()
export class Nft721Resource implements ResourceInterface {
  async getResource(): Promise<ResourceWithOptions> {
    return {
      resource: Nft721,
      options: {
        navigation: {
          name: 'Setting',
          icon: 'Tools'
        },
        properties: {
          address: {
            components: {
              list: Components.Scanlink
            }
          }
        },
        editProperties: ['address', 'imgUrl', 'name'],
        sort: {
          sortBy: 'id',
          direction: 'desc'
        }
      }
    }
  }
}
