import { Injectable } from '@nestjs/common'
import { NetworkRepository } from './network.repository'

@Injectable()
export class NetworkService {
  constructor(private readonly networkRepository: NetworkRepository) {}

  async getNetworks() {
    return await this.networkRepository.find()
  }
}
