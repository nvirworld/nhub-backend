import { APP } from '@/app.config'
import { ConfigModule } from '@/common/config/config.module'
import { EntityModule } from '@/common/entities/entity.module'
import { NODE_ENV } from '@/common/env'
import { LoggerModule, LoggerService } from '@/common/logger'
import { getMiddleware } from '@/common/logger/logger.middleware'
import { AdminModule } from '@/modules/admin/admin.module'
import { ApiModule } from '@/modules/api/api.module'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ServeStaticModule } from '@nestjs/serve-static'
import { join } from 'path'
import { AppController } from './app.controller'

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/static'
    }),
    ConfigModule.registerAsync({
      useFactory: async () => {
        return {
          secretManagerClientOptions: {
            region: APP.AWS.REGION,
            credentials: APP.AWS.CREDENTIALS
          },
          secretKey: process.env.AWS_SECRET ?? ''
        }
      }
    }),
    LoggerModule.registerAsync({
      useFactory: () => {
        return {
          expressLogParserOptions: {
            // TODO: admin password
            filterParameters: [],
            maxResponseBodyLength: false,
            filteredValue: '[FILTERED]'
          },
          winstonLoggerOptions: {
            isDebugMode:
              APP.ENV.nodeEnv === NODE_ENV.local ||
              APP.ENV.nodeEnv === NODE_ENV.test,
            level:
              APP.ENV.nodeEnv === NODE_ENV.local ||
              APP.ENV.nodeEnv === NODE_ENV.test
                ? 'debug'
                : 'info',
            assignedFormat: {
              env: APP.ENV.nodeEnv,
              buildVersion: APP.BUILD_VERSION
            }
          }
        }
      }
    }),
    EntityModule,
    AdminModule,
    ApiModule
  ],
  controllers: [AppController],
  providers: []
})
export class AppModule implements NestModule {
  constructor(private readonly loggerService: LoggerService) {}

  configure(consumer: MiddlewareConsumer): any {
    // TODO: admin logging
    consumer
      .apply(getMiddleware(this.loggerService))
      .exclude('/health')
      .forRoutes('*')
  }
}
