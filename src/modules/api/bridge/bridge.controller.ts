import { CacheInterceptor } from '@nestjs/cache-manager'
import { CacheTTL, Controller, Get, UseInterceptors } from '@nestjs/common'
import { BridgeService } from './bridge.service'
import { BridgeListResDto } from './dto/list.dto'

@Controller('/bridge')
@UseInterceptors(CacheInterceptor)
export class BridgeController {
  constructor(private readonly bridgeService: BridgeService) {}

  @Get('/')
  @CacheTTL(10000)
  async list() {
    return new BridgeListResDto(await this.bridgeService.getBridges())
  }
}
