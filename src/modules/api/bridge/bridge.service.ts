import { Injectable } from '@nestjs/common'
import { BridgeRepository } from './bridge.repository'

@Injectable()
export class BridgeService {
  constructor(private readonly bridgeRepository: BridgeRepository) {}

  async getBridge(id: number) {
    return await this.bridgeRepository.findOneBridge(id)
  }

  async getBridges() {
    return await this.bridgeRepository.findBridges()
  }

  async updateLastBlock(id: number, lastBlock: number) {
    return await this.bridgeRepository.update(id, { lastBlock })
  }
}
