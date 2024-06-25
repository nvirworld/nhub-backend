import { Nft721 } from '@/common/entities/nft-721.entity'
import { IsNotEmpty, IsString } from 'class-validator'

export interface OpenSeaNftItem {
  identifier: string
  collection: string
  contract: string
  token_standard: string
  name: string | null
  description: string | null
  image_url: string | null
  metadata_url: string | null
  is_disabled: boolean
  is_nsfw: boolean
}
export interface OpenSeaResponse {
  nfts: OpenSeaNftItem[]
  next?: string
}

export class PoolNftListReqQueryDto {
  @IsNotEmpty()
  @IsString()
  address: string
}

export interface NftItem {
  tokenId: string
  collection: string
  tokenStandard: string
  imgUrl: string
}
export class PoolNftListResDto {
  nfts: NftItem[]
  stakedNfts: NftItem[]

  constructor(
    nfts: OpenSeaNftItem[],
    stakedNfts: OpenSeaNftItem[],
    nft721: Nft721
  ) {
    this.nfts = nfts.map(nft => ({
      tokenId: nft.identifier,
      collection: nft.collection,
      tokenStandard: nft.token_standard,
      imgUrl: nft.image_url ?? nft721.imgUrl
    }))
    this.stakedNfts = stakedNfts.map(nft => ({
      tokenId: nft.identifier,
      collection: nft.collection,
      tokenStandard: nft.token_standard,
      imgUrl: nft.image_url ?? nft721.imgUrl
    }))
  }
}
