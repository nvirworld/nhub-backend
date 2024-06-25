import { Module } from '@nestjs/common'
import { ConfigurableModuleClass } from './config.module-definition'
import { ConfigService } from './config.service'

@Module({
  providers: [ConfigService],
  exports: [ConfigService]
})
export class ConfigModule extends ConfigurableModuleClass {}
