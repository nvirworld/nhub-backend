import { APP } from '@/app.config'
import { TokenPrice } from '@/common/entities/token-price.entity'
import { Token } from '@/common/entities/token.entity'
import { NODE_ENV } from '@/common/env'
import { LoggerService } from '@/common/logger'
import { HttpService } from '@nestjs/axios'
import { Inject, Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { firstValueFrom } from 'rxjs'
import {
  CoinmarketcapResponse,
  TokenModuleOptions,
  TOKEN_MODULE_OPTIONS
} from './token.interface'

@Injectable()
export class TokenService {
  constructor(
    @Inject(TOKEN_MODULE_OPTIONS)
    private readonly tokenModuleOptions: TokenModuleOptions,
    private readonly httpService: HttpService,
    private readonly loggerService: LoggerService
  ) {}

  @Cron('*/30 * * * * *')
  async syncTokenPrice() {
    if (APP.ENV.nodeEnv !== NODE_ENV.prod) {
      return
    }
    const tokens = await Token.find({
      relations: {
        network: true
      }
    })
    for (const token of tokens) {
      try {
        // testnet
        if (
          // eth, bsc, arb, polygon, op, kcc
          ![1, 56, 42161, 137, 10, 321].includes(token.network?.chainId ?? 0)
        ) {
          continue
        }
        const { data } = await firstValueFrom(
          this.httpService.get<CoinmarketcapResponse>(
            `${this.tokenModuleOptions.coinmarketcap.endPoint}/v2/tools/price-conversion?amount=1&convert=usd&symbol=${token.symbol}`,
            {
              headers: {
                'X-CMC_PRO_API_KEY':
                  this.tokenModuleOptions.coinmarketcap.apiKey
              }
            }
          )
        )

        const usdInfo = data.data[0].quote.USD
        const price = usdInfo.price.toString()
        const renewedAt = new Date(usdInfo.last_updated)
        await TokenPrice.update(
          {
            tokenId: token.id,
            currency: 'USD'
          },
          {
            price,
            renewedAt
          }
        )
      } catch (err) {
        this.loggerService.err('token price sync failed', { err })
      }
    }
  }
}
