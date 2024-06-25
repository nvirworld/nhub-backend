import { BridgeRow } from '@/modules/api/bridge/bridge.repository'

export const BRIDGE_MODULE_OPTIONS = 'BRIDGE_MODULE_OPTIONS'
export interface BridgeModuleOptions {
  aesSecretKey: string
}

export interface Transfer {
  transactionHash: string
  blockNumber: number
  from: string
  to: string
  amount: string
  bridge: BridgeRow
  exchange: {
    fee: string
    amount: string
  }
}
