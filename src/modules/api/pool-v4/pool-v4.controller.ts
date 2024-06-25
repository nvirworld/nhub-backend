import { PoolNftListResDto } from '@/modules/api/pool-v4/dto/nft-list.dto'
import { CacheInterceptor } from '@nestjs/cache-manager'
import {
  CacheTTL,
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors
} from '@nestjs/common'
import { PoolListResDto } from './dto/list.dto'
import { PoolSupplyResDto } from './dto/supply.dto'
import {
  PoolNftListReqQueryDto,
  PoolViewReqParamDto,
  PoolViewResDto
} from './dto/view.dto'
import { PoolV4Service } from './pool-v4.service'

@Controller('/poolv4')
@UseInterceptors(CacheInterceptor)
export class PoolV4Controller {
  constructor(private readonly poolService: PoolV4Service) {}

  @Get('/')
  @CacheTTL(10000)
  async list() {
    return new PoolListResDto(await this.poolService.getPools())
  }

  @Get('/:id(\\d+)')
  @CacheTTL(10000)
  async view(@Param() poolViewReqParamDto: PoolViewReqParamDto) {
    return new PoolViewResDto(
      await this.poolService.getPool(poolViewReqParamDto.id)
    )
  }

  @Get('/:id(\\d+)/nft')
  async nftList(
    @Param() poolViewReqParamDto: PoolViewReqParamDto,
    @Query() poolNftListReqQueryDto: PoolNftListReqQueryDto
  ) {
    const { nfts, stakedNfts, nft721 } = await this.poolService.getPoolNftList(
      poolViewReqParamDto.id,
      poolNftListReqQueryDto.address
    )
    return new PoolNftListResDto(nfts, stakedNfts, nft721)
  }

  @Get('/supply')
  // 5 min
  @CacheTTL(1000 * 60 * 5)
  async supply() {
    const [tvls, trls, tnl] = await Promise.all([
      this.poolService.getTotalValueLocked(),
      this.poolService.getTotalRevenueLocked(),
      this.poolService.getTotalNFTLocked()
    ])

    return new PoolSupplyResDto(tvls, trls, tnl)
  }
}
