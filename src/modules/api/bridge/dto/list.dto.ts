import { Network } from '@/common/entities/network.entity'
import { BridgeRow, BridgeTokenRow } from '../bridge.repository'

export class BridgeTokenItemDto {
  id: number
  networkId: number
  name: string
  iconUrl: string
  symbol: string
  address: string
  decimals: number
  network: Network

  constructor(token: BridgeTokenRow) {
    this.id = token.id
    this.networkId = token.networkId
    this.name = token.name
    this.iconUrl = token.iconUrl
    this.symbol = token.symbol
    this.address = token.address
    this.decimals = token.decimals
    this.network = token.network
  }
}

export class BridgeItemDto {
  id: number
  minimum: number
  feeFixed: number
  feeRate: number
  address: string
  inToken: BridgeTokenItemDto
  outToken: BridgeTokenItemDto

  constructor(bridge: BridgeRow) {
    this.id = bridge.id
    this.minimum = bridge.minimum
    this.feeFixed = bridge.feeFixed
    this.feeRate = bridge.feeRate
    this.address = bridge.deployer.address
    this.inToken = new BridgeTokenItemDto(bridge.inToken)
    this.outToken = new BridgeTokenItemDto(bridge.outToken)
  }
}

export class BridgeListResDto {
  bridges: BridgeItemDto[]

  constructor(bridges: BridgeRow[]) {
    this.bridges = bridges.map(bridge => new BridgeItemDto(bridge))
  }
}
