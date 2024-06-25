import { ConfigService } from '@/common/config'
import { LoggerService } from '@/common/logger'
import { TypeormLogger } from '@/common/logger/typeorm-logger'
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { entities } from './entity.providers'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService, LoggerService],
      useFactory: async (
        configService: ConfigService,
        loggerService: LoggerService
      ) => {
        const dbConnectionInfo = {
          host: await configService.get('rdsHost'),
          hostReader: await configService.get('rdsHostReader'),
          database: await configService.get('rdsDatabase'),
          username: await configService.get('rdsUsername'),
          password: await configService.get('rdsPassword'),
          connectionLimit: 30,
          port: await configService.get('rdsPort')
        }
        return {
          type: 'mysql',
          synchronize: false,
          timezone: '+00:00',
          entities,
          replication: {
            master: {
              host: dbConnectionInfo.host,
              port: dbConnectionInfo.port,
              database: dbConnectionInfo.database,
              username: dbConnectionInfo.username,
              password: dbConnectionInfo.password
            },
            slaves: [
              {
                host: dbConnectionInfo.hostReader,
                port: dbConnectionInfo.port,
                database: dbConnectionInfo.database,
                username: dbConnectionInfo.username,
                password: dbConnectionInfo.password
              }
            ]
          },
          logger: new TypeormLogger(loggerService)
        }
      }
    })
  ],
  providers: [],
  exports: []
})
export class EntityModule {}
