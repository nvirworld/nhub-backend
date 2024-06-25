import { CustomRepository } from '@/common/entities/custom-repository'
import { Network } from '@/common/entities/network.entity'
import { Repository } from 'typeorm'

@CustomRepository(Network)
export class NetworkRepository extends Repository<Network> {}
