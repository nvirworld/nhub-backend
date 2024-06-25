import { Network } from '@/common/entities/network.entity'

export class NetworkListResDto {
  networks: Network[]

  constructor(networks: Network[]) {
    this.networks = networks
  }
}
