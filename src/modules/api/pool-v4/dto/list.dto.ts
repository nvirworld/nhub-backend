import { PoolRow } from '@/modules/api/pool-v4/pool-v4.repository'
import { PoolItemDto } from './view.dto'

export class PoolListResDto {
  pools: PoolItemDto[]

  constructor(pools: PoolRow[]) {
    this.pools = pools.map(pool => new PoolItemDto(pool))
  }
}
