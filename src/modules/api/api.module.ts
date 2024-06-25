import { ResponseInterceptor } from '@/common/response'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { BridgeModule } from './bridge/bridge.module'
import { NetworkModule } from './network/network.module'
import { PoolV4Module } from './pool-v4/pool-v4.module'
import { TokenModule } from './token/token.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true
    }),
    TokenModule,
    PoolV4Module,
    NetworkModule,
    BridgeModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor
    }
  ]
})
export class ApiModule {}
