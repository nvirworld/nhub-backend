import { CustomRepository } from '@/common/entities/custom-repository'
import { Network } from '@/common/entities/network.entity'
import { Nft1155 } from '@/common/entities/nft-1155.entity'
import { Nft721 } from '@/common/entities/nft-721.entity'
import { PoolV4 } from '@/common/entities/pool-v4.entity'
import { TokenPrice } from '@/common/entities/token-price.entity'
import { Token } from '@/common/entities/token.entity'
import { Repository } from 'typeorm'

export class TokenRow extends Token {
  tokenPrices: TokenPrice[]
}
export class PoolRow extends PoolV4 {
  address: string
  network: Network
  stakingToken: TokenRow | null

  rewardToken: TokenRow

  stakingNft721: Nft721 | null
  stakingNft1155: Nft1155 | null
}

export class TotalRewardRow {
  rewardTokenVolume: string
  symbol: string
}

@CustomRepository(PoolV4)
export class PoolV4Repository extends Repository<PoolV4> {
  getBaseQuery() {
    return this.createQueryBuilder('p')
      .innerJoinAndSelect('p.network', 'n')
      .leftJoinAndSelect('p.stakingToken', 'st')
      .leftJoinAndSelect('st.tokenPrices', 'stp')
      .innerJoinAndSelect('p.rewardToken', 'rt')
      .leftJoinAndSelect('rt.tokenPrices', 'rtp')
      .leftJoinAndSelect('p.stakingNft721', 'nft721')
      .leftJoinAndSelect('p.stakingNft1155', 'nft1155')
  }

  async findActivePools() {
    return (await this.getBaseQuery()
      .where('activatedAt < NOW()')
      .orderBy('p.id', 'DESC')
      .getMany()) as PoolRow[]
  }

  async findOneActivePool(id: number) {
    return (await this.getBaseQuery()
      .where('activatedAt < NOW()')
      .andWhere('p.id = :id', { id })
      .getOne()) as PoolRow
  }

  async findPoolsWithActivationHistory() {
    return (await this.getBaseQuery()
      .where('activatedAt < NOW()')
      .getMany()) as PoolRow[]
  }

  async findFinishedPoolsTotalReward() {
    return await this.getBaseQuery().andWhere('endedAt < NOW()').getMany()
  }
}
