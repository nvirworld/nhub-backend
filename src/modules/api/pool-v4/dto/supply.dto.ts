import { chain, sumBy } from 'lodash'

export interface TotalSupplyRow {
  symbol: string
  usd: number
  amount: number
}

export class PoolSupplyResDto {
  tvl: string
  trl: string
  tnl: string
  tvlUsd: number
  trlUsd: number

  tvls: TotalSupplyRow[]
  trls: TotalSupplyRow[]

  constructor(tvls: TotalSupplyRow[], trls: TotalSupplyRow[], tnl: number) {
    this.tvl = sumBy(tvls, tvl => tvl.amount).toString()
    this.trl = sumBy(trls, trl => trl.amount).toString()
    this.tnl = tnl.toString()
    this.tvlUsd = sumBy(tvls, tvl => tvl.amount * tvl.usd)
    this.trlUsd = sumBy(trls, trl => trl.amount * trl.usd)

    this.tvls = chain(tvls)
      .groupBy(tvl => tvl.symbol)
      .values()
      .map(tvls => {
        return {
          symbol: tvls[0].symbol,
          amount: sumBy(tvls, tvl => Number(tvl.amount)),
          usd: sumBy(tvls, tvl => Number(tvl.amount) * tvl.usd)
        }
      })
    this.trls = chain(trls)
      .groupBy(trl => trl.symbol)
      .values()
      .map(trls => {
        return {
          symbol: trls[0].symbol,
          amount: sumBy(trls, trl => Number(trl.amount)),
          usd: sumBy(trls, trl => Number(trl.amount) * trl.usd)
        }
      })
  }
}
