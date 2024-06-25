import { CustomTypeOrmModule } from '@/common/entities/custom-repository'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { NetworkController } from './network.controller'
import { NetworkRepository } from './network.repository'
import { NetworkService } from './network.service'

@Module({
  imports: [
    CustomTypeOrmModule.forCustomRepository([NetworkRepository]),
    CacheModule.register()
  ],
  providers: [NetworkService],
  controllers: [NetworkController],
  exports: [NetworkService]
})
export class NetworkModule {}
