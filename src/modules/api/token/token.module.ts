import { ConfigService } from '@/common/config'
import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { TokenModuleOptions, TOKEN_MODULE_OPTIONS } from './token.interface'
import { TokenService } from './token.service'

@Module({
  imports: [HttpModule],
  providers: [
    {
      provide: TOKEN_MODULE_OPTIONS,
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService
      ): Promise<TokenModuleOptions> => {
        return {
          coinmarketcap: {
            endPoint: await configService.get('coinmarketcapEndPoint'),
            apiKey: await configService.get('coinmarketcapApiKey')
          }
        }
      }
    },
    TokenService
  ],
  exports: [TokenService]
})
export class TokenModule {}
