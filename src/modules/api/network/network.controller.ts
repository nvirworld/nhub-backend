import { CacheInterceptor } from '@nestjs/cache-manager'
import { CacheTTL, Controller, Get, UseInterceptors } from '@nestjs/common'
import { NetworkListResDto } from './dto/list.dto'
import { NetworkService } from './network.service'

@Controller('/network')
@UseInterceptors(CacheInterceptor)
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Get('/')
  @CacheTTL(60_000)
  async list() {
    const networks = await this.networkService.getNetworks()
    return new NetworkListResDto(networks)
  }
}
