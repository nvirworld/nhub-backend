import { PoolRow, TokenRow } from '@/modules/api/pool-v4/pool-v4.repository'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class PoolViewReqParamDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  id: number
}

export class PoolNftListReqQueryDto {
  @IsNotEmpty()
  @IsString()
  address: string
}

export class TokenItemDto {
  id: number
  name: string
  iconUrl: string
  symbol: string
  address: string
  decimals: number
  tokenPrices: Array<{
    id: number
    currency: string
    price: number
  }>

  constructor(token: TokenRow) {
    this.id = token.id
    this.name = token.name
    this.iconUrl = token.iconUrl
    this.symbol = token.symbol
    this.address = token.address
    this.decimals = token.decimals
    this.tokenPrices =
      token.tokenPrices.map(tokenPrice => ({
        id: tokenPrice.id,
        currency: tokenPrice.currency,
        price: Number(tokenPrice.price)
      })) ?? []
  }
}

export class PoolItemDto {
  id: number
  name: string
  address: string
  startedAt: Date
  endedAt: Date
  withdrawEnabledAt: Date
  stakingTokenMin: number
  stakingNftMin: number
  network: {
    id: number
    chainId: number
    name: string
    rpc: string
    scan: string
    currency: string
  }

  stakingToken: TokenItemDto | null
  rewardToken: TokenItemDto
  stakingNft721: {
    id: number
    name: string
    address: string
    imgUrl: string
  } | null

  stakingNft1155: {
    id: number
    name: string
    address: string
    imgUrl: string
    tokenId: string
  } | null

  constructor(pool: PoolRow) {
    this.id = pool.id
    this.name = pool.name
    this.address = pool.address ?? ''
    this.startedAt = pool.startedAt
    this.endedAt = pool.endedAt
    this.withdrawEnabledAt = pool.withdrawEnabledAt
    this.stakingTokenMin = Number(pool.stakingTokenMin)
    this.stakingNftMin = pool.stakingNftMin
    this.network = {
      id: pool.networkId,
      chainId: pool.network.chainId,
      name: pool.network.name,
      rpc: pool.network.rpc,
      scan: pool.network.scan,
      currency: pool.network.currency
    }
    this.stakingToken =
      pool.stakingToken != null ? new TokenItemDto(pool.stakingToken) : null
    this.rewardToken = new TokenItemDto(pool.rewardToken)
    this.stakingNft721 =
      pool.stakingNft721 == null
        ? null
        : {
            id: pool.stakingNft721.id,
            name: pool.stakingNft721.name,
            address: pool.stakingNft721.address,
            imgUrl: pool.stakingNft721.imgUrl
          }
    this.stakingNft1155 =
      pool.stakingNft1155 == null
        ? null
        : {
            id: pool.stakingNft1155.id,
            name: pool.stakingNft1155.name,
            address: pool.stakingNft1155.address,
            imgUrl: pool.stakingNft1155.imgUrl,
            tokenId: pool.stakingNft1155.tokenId
          }
  }
}

export class PoolViewResDto {
  pool: PoolItemDto

  constructor(pool: PoolRow) {
    this.pool = new PoolItemDto(pool)
  }
}
