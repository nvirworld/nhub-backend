import { Token } from '@/common/entities/token.entity'
import { Components } from '@/modules/admin/components'
import { ResourceInterface } from '@/modules/admin/resources/resource.interface'
import { Injectable } from '@nestjs/common'
import { ResourceWithOptions } from 'adminjs'

@Injectable()
export class TokenResource implements ResourceInterface {
  async getResource(): Promise<ResourceWithOptions> {
    return {
      resource: Token,
      options: {
        navigation: {
          name: 'Setting',
          icon: 'Tools'
        },
        actions: {
          show: {
            isVisible: false
          }
        },
        properties: {
          address: {
            components: {
              list: Components.Scanlink
            }
          }
        },
        listProperties: [
          'id',
          'name',
          'symbol',
          'networkId',
          'address',
          'decimals',
          'createdAt'
        ],
        editProperties: [
          'name',
          'iconUrl',
          'symbol',
          'networkId',
          'address',
          'decimals'
        ],
        sort: {
          sortBy: 'id',
          direction: 'desc'
        }
      }
    }
  }
}
