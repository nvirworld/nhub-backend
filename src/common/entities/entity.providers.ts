import { Admin } from './admin.entity'
import { Bridge } from './bridge.entity'
import { Deployer } from './deployer.entity'
import { Network } from './network.entity'
import { Nft1155 } from './nft-1155.entity'
import { Nft721 } from './nft-721.entity'
import { PoolDeployLog } from './pool-deploy-log.entity'
import { PoolV4DeployLog } from './pool-v4-deploy-log.entity'
import { PoolV4 } from './pool-v4.entity'
import { Pool } from './pool.entity'
import { TokenPrice } from './token-price.entity'
import { Token } from './token.entity'
export const entities = [
  Admin,
  Deployer,
  Network,
  Pool,
  Token,
  TokenPrice,
  PoolDeployLog,
  PoolV4DeployLog,
  PoolV4,
  Nft721,
  Nft1155,
  Bridge
]
