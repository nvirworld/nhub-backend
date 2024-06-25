import { AdminResource } from '@/modules/admin/resources/admin.resource'
import { DeployerResource } from '@/modules/admin/resources/deployer.resource'
import { NetworkResource } from '@/modules/admin/resources/network.resource'
import { Nft1155Resource } from '@/modules/admin/resources/nft1155.resource'
import { Nft721Resource } from '@/modules/admin/resources/nft721.resource'
import { PoolV4DeployLogResource } from '@/modules/admin/resources/pool-v4-deploy-log.resource'
import { PoolV4Resource } from '@/modules/admin/resources/pool-v4.resource'
import { TokenResource } from '@/modules/admin/resources/token.resource'
import { Injectable } from '@nestjs/common'

@Injectable()
export class ResourceService {
  constructor(
    private readonly adminResource: AdminResource,
    private readonly deployerResource: DeployerResource,
    private readonly networkResource: NetworkResource,
    private readonly tokenResource: TokenResource,
    private readonly poolV4Resource: PoolV4Resource,
    private readonly nft1155Resource: Nft1155Resource,
    private readonly nft721Resource: Nft721Resource,
    private readonly poolV4DeployLogResource: PoolV4DeployLogResource
  ) {}

  async getResources() {
    return await Promise.all([
      await this.adminResource.getResource(),
      await this.deployerResource.getResource(),
      await this.networkResource.getResource(),
      await this.tokenResource.getResource(),
      await this.poolV4Resource.getResource(),
      await this.nft1155Resource.getResource(),
      await this.nft721Resource.getResource(),
      await this.poolV4DeployLogResource.getResource()
    ])
  }
}
