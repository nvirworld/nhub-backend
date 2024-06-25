import { Nft1155 } from '@/common/entities/nft-1155.entity'
import { Components } from '@/modules/admin/components'
import { ResourceInterface } from '@/modules/admin/resources/resource.interface'
import { Injectable } from '@nestjs/common'
import { ResourceWithOptions } from 'adminjs'

@Injectable()
export class Nft1155Resource implements ResourceInterface {
  async getResource(): Promise<ResourceWithOptions> {
    return {
      resource: Nft1155,
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
        editProperties: ['address', 'imgUrl', 'tokenId', 'name'],
        sort: {
          sortBy: 'id',
          direction: 'desc'
        }
      }
    }
  }
}
