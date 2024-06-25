import { Bridge } from '@/common/entities/bridge.entity'
import { CustomRepository } from '@/common/entities/custom-repository'
import { Deployer } from '@/common/entities/deployer.entity'
import { Network } from '@/common/entities/network.entity'
import { Token } from '@/common/entities/token.entity'
import { Repository } from 'typeorm'

export class BridgeTokenRow extends Token {
  network: Network
}

export class BridgeRow extends Bridge {
  deployer: Deployer
  inToken: BridgeTokenRow
  outToken: BridgeTokenRow
}

@CustomRepository(Bridge)
export class BridgeRepository extends Repository<Bridge> {
  createBaseQuery() {
    return this.createQueryBuilder('bridge')
      .innerJoinAndSelect('bridge.deployer', 'deployer')
      .innerJoinAndSelect('bridge.inToken', 'inToken')
      .innerJoinAndSelect('inToken.network', 'inTokenNetwork')
      .innerJoinAndSelect('bridge.outToken', 'outToken')
      .innerJoinAndSelect('outToken.network', 'outTokenNetwork')
  }

  async findOneBridge(id: number) {
    return (await this.createBaseQuery()
      .where('bridge.id = :id', { id })
      .getOne()) as BridgeRow | null
  }

  async findBridges() {
    return (await this.createBaseQuery().getMany()) as BridgeRow[]
  }
}
