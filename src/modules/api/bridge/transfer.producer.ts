import { APP } from '@/app.config'
import * as ERC20Abi from '@/common/abi/erc20.abi.json'
import { LoggerService } from '@/common/logger/logger.service'
import webhook from '@/common/webhook'
import { Injectable } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { SqsService } from '@ssut/nestjs-sqs'
import { ethers } from 'ethers'
import { Transfer } from './bridge.interface'
import { BridgeService } from './bridge.service'

@Injectable()
export class TransferProducer {
  constructor(
    private readonly bridgeService: BridgeService,
    private readonly sqsService: SqsService,
    private readonly loggerService: LoggerService
  ) {}

  @Cron('* * * * *')
  async monitor() {
    this.loggerService.info('monitor', {})
    const bridges = await this.bridgeService.getBridges()

    for (const bridge of bridges) {
      try {
        this.loggerService.info(
          `${bridge.inToken.network.name} => ${bridge.outToken.network.name} (${bridge.inToken.name} => ${bridge.inToken.name})`,
          {
            bridge
          }
        )

        // network, provider, key init
        const { lastBlock } = bridge
        const fromNetwork = bridge.inToken.network

        const fetchRequest = new ethers.FetchRequest(fromNetwork.rpc)
        fetchRequest.setHeader('Origin', APP.SITE)
        const fromProvider = new ethers.JsonRpcProvider(fetchRequest)

        const fromBlock = lastBlock + 1

        // getBlock Number 실행을 먼저 해 현재 BlockNumber 를 알아냄
        const currentBlock = await fromProvider.getBlockNumber()
        const toBlock =
          fromBlock + 5000 > currentBlock ? currentBlock : fromBlock + 5000
        this.loggerService.info(
          `currentBlock : ${currentBlock} / fromBlock : ${fromBlock} / toBlock : ${toBlock}`,
          {}
        )
        const erc20 = new ethers.Interface(ERC20Abi)
        const logs = await fromProvider.getLogs({
          address: bridge.inToken.address,
          fromBlock,
          toBlock,
          topics: [
            ethers.id('Transfer(address,address,uint256)'),
            null,
            ethers.zeroPadValue(bridge.deployer.address, 32)
          ]
        })

        for (const log of logs) {
          // 필요한 필드 추출
          const { transactionHash, blockNumber, topics, data } = log

          const parsedLog = erc20.parseLog({
            topics: topics as string[],
            data
          })

          if (parsedLog == null) {
            throw new Error(`invalid parsed log`)
          }

          const { args } = parsedLog
          const from = args[0] as string
          const to = args[1] as string
          const amount = args[2] as bigint

          if (from == null || to == null || amount == null) {
            throw new Error(`invalid log (${from}, ${to}, ${amount}`)
          }

          const fixedFee = ethers.parseUnits(
            bridge.feeFixed.toString(),
            bridge.inToken.decimals
          )
          // bigint 곱셈
          const precision = 10 ** bridge.inToken.decimals
          const feeRateBigInt = BigInt(bridge.feeRate * precision) / 100n
          const rateFee = (amount * feeRateBigInt) / BigInt(precision)

          const fee = fixedFee + rateFee
          const exchangeAmount = amount - fee

          // 0 미만 처리는 queue 소비시 처리
          const transfer: Transfer = {
            transactionHash,
            blockNumber,
            from,
            to,
            amount: amount.toString(),
            bridge,
            exchange: {
              fee: fee.toString(),
              amount: exchangeAmount.toString()
            }
          }

          this.loggerService.info('transfer', { transfer })

          await this.sqsService.send<Transfer>('transfer', {
            id: transactionHash,
            groupId: transactionHash,
            deduplicationId: transactionHash,
            body: transfer
          })
        }

        await this.bridgeService.updateLastBlock(bridge.id, toBlock)
      } catch (err) {
        const { message, stack } = err
        this.loggerService.err(message, { err })
        await webhook.send({
          text: `*[ERROR]*\n\`\`\`${message as string}\n${
            stack as string
          }\`\`\``
        })
      }
    }
  }
}
