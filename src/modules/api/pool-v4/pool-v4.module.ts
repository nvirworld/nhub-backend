import { ConfigService } from '@/common/config'
import { CustomTypeOrmModule } from '@/common/entities/custom-repository'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { PoolV4Controller } from './pool-v4.controller'
import { PoolModuleOptions, POOL_MODULE_OPTIONS } from './pool-v4.interface'
import { PoolV4Repository } from './pool-v4.repository'
import { PoolV4Service } from './pool-v4.service'

@Module({
  imports: [
    CustomTypeOrmModule.forCustomRepository([PoolV4Repository]),
    HttpModule
  ],
  controllers: [PoolV4Controller],
  providers: [
    PoolV4Service,
    {
      provide: POOL_MODULE_OPTIONS,
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService
      ): Promise<PoolModuleOptions> => {
        return {
          openSeaApiKey: await configService.get('openSeaApiKey')
        }
      }
    }
  ],
  exports: [PoolV4Service]
})
export class PoolV4Module {}
