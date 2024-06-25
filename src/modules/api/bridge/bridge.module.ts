import { APP } from '@/app.config'
import { ConfigService } from '@/common/config'
import { CustomTypeOrmModule } from '@/common/entities/custom-repository'
import {
  BridgeModuleOptions,
  BRIDGE_MODULE_OPTIONS
} from '@/modules/api/bridge/bridge.interface'
import { TransferConsumer } from '@/modules/api/bridge/transfer.consumer'
import { SQSClient } from '@aws-sdk/client-sqs'
import { Module } from '@nestjs/common'
import { SqsModule } from '@ssut/nestjs-sqs'
import { BridgeController } from './bridge.controller'
import { BridgeRepository } from './bridge.repository'
import { BridgeService } from './bridge.service'
import { TransferProducer } from './transfer.producer'

@Module({
  imports: [
    SqsModule.registerAsync({
      useFactory: async () => {
        const sqs = new SQSClient({
          region: APP.AWS.REGION,
          credentials: APP.AWS.CREDENTIALS
        })
        return {
          consumers: [
            {
              name: 'transfer',
              sqs,
              queueUrl: APP.AWS.SQS_URL
            }
          ],
          producers: [
            {
              name: 'transfer',
              sqs,
              queueUrl: APP.AWS.SQS_URL
            }
          ]
        }
      }
    }),
    CustomTypeOrmModule.forCustomRepository([BridgeRepository])
  ],
  controllers: [BridgeController],
  providers: [
    BridgeService,
    {
      provide: BRIDGE_MODULE_OPTIONS,
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService
      ): Promise<BridgeModuleOptions> => {
        return {
          aesSecretKey: await configService.get('aesSecretKey')
        }
      }
    },
    TransferProducer,
    TransferConsumer
  ],
  exports: [BridgeService]
})
export class BridgeModule {}
