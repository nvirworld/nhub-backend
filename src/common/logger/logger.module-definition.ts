import { ConfigurableModuleBuilder } from '@nestjs/common'
import { LoggerModuleOptions } from './logger.interface'

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<LoggerModuleOptions>()
    .setExtras(
      {
        isGlobal: true
      },
      (definition, extras) => ({
        ...definition,
        global: extras.isGlobal
      })
    )
    .build()
