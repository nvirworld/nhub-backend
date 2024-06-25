import { ConfigService } from '@/common/config'
import { DeployerResource } from '@/modules/admin/resources/deployer.resource'
import { Nft1155Resource } from '@/modules/admin/resources/nft1155.resource'
import { Nft721Resource } from '@/modules/admin/resources/nft721.resource'
import { PoolV4DeployLogResource } from '@/modules/admin/resources/pool-v4-deploy-log.resource'
import { PoolV4Resource } from '@/modules/admin/resources/pool-v4.resource'
import { TokenResource } from '@/modules/admin/resources/token.resource'
import { Module } from '@nestjs/common'
import { AdminResource } from './admin.resource'
import { NetworkResource } from './network.resource'
import {
  ResourceModuleOptions,
  RESOURCE_MODULE_OPTIONS
} from './resource.interface'
import { ResourceService } from './resource.service'

@Module({
  providers: [
    {
      provide: RESOURCE_MODULE_OPTIONS,
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService
      ): Promise<ResourceModuleOptions> => {
        return {
          aesSecretKey: await configService.get('aesSecretKey')
        }
      }
    },
    AdminResource,
    DeployerResource,
    NetworkResource,
    ResourceService,
    PoolV4Resource,
    TokenResource,
    Nft1155Resource,
    Nft721Resource,
    PoolV4DeployLogResource
  ],
  exports: [ResourceService]
})
export class ResourceModule {}
