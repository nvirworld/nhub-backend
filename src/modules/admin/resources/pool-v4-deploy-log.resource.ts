import { PoolV4DeployLog } from '@/common/entities/pool-v4-deploy-log.entity'
import { LoggerService } from '@/common/logger'
import { ResourceInterface } from '@/modules/admin/resources/resource.interface'
import { Injectable } from '@nestjs/common'
import { ResourceWithOptions } from 'adminjs'

@Injectable()
export class PoolV4DeployLogResource implements ResourceInterface {
  constructor(private readonly loggerService: LoggerService) {}

  async getResource(): Promise<ResourceWithOptions> {
    return {
      resource: PoolV4DeployLog,
      options: {
        navigation: {
          name: 'Pool',
          icon: 'Cloud Logging'
        },
        actions: {
          new: {
            isVisible: false
          },
          edit: {
            isVisible: false
          },
          delete: {
            isVisible: false
          },
          bulkDelete: {
            isVisible: false
          }
        },
        listProperties: ['id', 'poolV4Id', 'level', 'message', 'createdAt'],
        sort: {
          sortBy: 'id',
          direction: 'desc'
        }
      }
    }
  }
}
