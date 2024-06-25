import { APP } from '@/app.config'
import { decryptAES } from '@/common/crypto'
import { LoggerService } from '@/common/logger/logger.service'
import webhook from '@/common/webhook'
import {
  BridgeModuleOptions,
  BRIDGE_MODULE_OPTIONS
} from '@/modules/api/bridge/bridge.interface'
import { BridgeService } from '@/modules/api/bridge/bridge.service'
import { Erc20Abi__factory } from '@/typechain-types/factories/Erc20Abi__factory'
import { Message } from '@aws-sdk/client-sqs'
import { Inject, Injectable } from '@nestjs/common'
import { SqsMessageHandler } from '@ssut/nestjs-sqs'
import { BigNumberish, ethers } from 'ethers'
import * as TelegramBot from 'node-telegram-bot-api'
import { Transfer } from './bridge.interface'

@Injectable()
export class TransferConsumer {
  constructor(
    private readonly loggerService: LoggerService,
    @Inject(BRIDGE_MODULE_OPTIONS)
    private readonly bridgeModuleOptions: BridgeModuleOptions,
    private readonly bridgeService: BridgeService
  ) {}

  @SqsMessageHandler('transfer', false)
  async handleMessage(message: Message) {
    this.loggerService.info('handleMessage', { message })
    try {
      if (message.Body == null) {
        throw new Error('Body is null')
      }

      const messageTransfer = JSON.parse(message.Body) as Transfer
      // bridge 재조회 (network rpc 변경등을 후속 조치하기 위함)
      const bridge = await this.bridgeService.getBridge(
        messageTransfer.bridge.id
      )
      if (bridge == null) {
        throw new Error('bridge is null')
      }

      const transfer = { ...messageTransfer, bridge }
      const { deployer, inToken, outToken } = bridge

      if (
        bridge == null ||
        deployer == null ||
        inToken == null ||
        outToken == null
      ) {
        throw new Error(`null value in transfer: ${JSON.stringify(transfer)}`)
      }

      const fromNetwork = inToken.network
      const toNetwork = outToken.network

      const fromFetchRequest = new ethers.FetchRequest(fromNetwork.rpc)
      fromFetchRequest.setHeader('Origin', APP.SITE)
      const fromProvider = new ethers.JsonRpcProvider(fromFetchRequest)

      const toFetchRequest = new ethers.FetchRequest(toNetwork.rpc)
      toFetchRequest.setHeader('Origin', APP.SITE)
      const toProvider = new ethers.JsonRpcProvider(toFetchRequest)

      // 6 confirmations rule
      const result = await fromProvider.waitForTransaction(
        transfer.transactionHash,
        6
      )
      this.loggerService.info('waitForTransaction 6 confirmations result', {
        transfer,
        result
      })

      const fromWallet = new ethers.Wallet(
        decryptAES(
          deployer.encryptedKey,
          deployer.salt,
          this.bridgeModuleOptions.aesSecretKey
        ),
        fromProvider
      )

      const toWallet = new ethers.Wallet(
        decryptAES(
          deployer.encryptedKey,
          deployer.salt,
          this.bridgeModuleOptions.aesSecretKey
        ),
        toProvider
      )
      if (
        ethers.getAddress(transfer.from) ===
        ethers.getAddress(bridge.distributorAddress)
      ) {
        await this.sendMessage({ ...transfer, fromWallet, toWallet }, 'deposit')
      } else {
        // minimum amount
        if (
          ethers.parseUnits(transfer.amount, inToken.decimals) < bridge.minimum
        ) {
          throw new Error('amount is less than minimum')
        }
        const outTransferTransaction = await Erc20Abi__factory.connect(
          bridge.outToken.address,
          toWallet
        ).transfer(transfer.from, transfer.exchange.amount)

        // 6 confirmation
        const outTransferResult = await toProvider.waitForTransaction(
          outTransferTransaction.hash,
          6
        )

        this.loggerService.info('swap transfer result', {
          outTransferTransaction,
          outTransferResult
        })

        await this.sendMessage(
          { ...transfer, fromWallet, toWallet },
          'transaction',
          outTransferTransaction.hash
        )
      }
    } catch (err) {
      this.loggerService.err(err.message, { err })
      const { message, stack } = err
      await webhook.send({
        text: `*[ERROR]*\n\`\`\`${message as string}\n${stack as string}\`\`\``
      })
      throw err
    }
  }

  private async sendMessage(
    transfer: Transfer & {
      fromWallet: ethers.Wallet
      toWallet: ethers.Wallet
    },
    type: 'deposit' | 'transaction',
    resultHash?: string
  ) {
    this.loggerService.info('sendMessage', {
      transfer,
      type,
      resultHash
    })

    const tokenDecimals = transfer.bridge.inToken.decimals

    try {
      const formatAmount = this.formatEtherForChat(
        transfer.amount,
        tokenDecimals,
        10
      )
      const formatExchangeAmount = this.formatEtherForChat(
        transfer.exchange.amount,
        tokenDecimals,
        10
      )
      const formatExchangeFee = this.formatEtherForChat(
        transfer.exchange.fee,
        tokenDecimals,
        10
      )

      let message: string
      const { bridge, fromWallet, toWallet } = transfer
      const { inToken, outToken } = bridge
      const baseBody =
        `${bridge.inToken.name} -> ${bridge.outToken.name}\n\n\n` +
        `${transfer.from}\n\n` +
        `rcv: ${formatAmount}`
      if (type === 'deposit') {
        message = `[DEPOSIT]\n\n${baseBody}\n\n\n`
      } else {
        message =
          `[SWAP]\n\n${baseBody}\n` +
          `fee: ${formatExchangeFee}\n` +
          `snd: ${formatExchangeAmount}\n\n\n`
      }

      message +=
        '[TRANSACTIONS]\n\n' + `rcv_tx\n` + `${transfer.transactionHash}\n\n`

      if (resultHash != null) {
        message += `snd_tx\n` + `${resultHash}\n\n`
      }

      const fromContract = Erc20Abi__factory.connect(
        inToken.address,
        fromWallet
      )
      const toContract = Erc20Abi__factory.connect(outToken.address, toWallet)

      const fromBalance =
        (await fromWallet.provider?.getBalance(fromWallet.address)) ?? 0n
      const fromEth = this.formatEtherForChat(fromBalance, 18, 10)
      const toBalance =
        (await toWallet.provider?.getBalance(toWallet.address)) ?? 0n
      const toEth = this.formatEtherForChat(toBalance, 18, 10)

      const fromToken = this.formatEtherForChat(
        await fromContract.balanceOf(fromWallet.address),
        tokenDecimals,
        10
      )
      const toToken = this.formatEtherForChat(
        await toContract.balanceOf(toWallet.address),
        tokenDecimals,
        10
      )

      message +=
        `\n[BRIDGE]\n\n` +
        `${fromWallet.address}\n\n` +
        `${inToken.network.name}\n` +
        ` * ${inToken.symbol}: ${fromToken}\n` +
        ` * ${inToken.network.currency}: ${fromEth}\n\n` +
        `${outToken.network.name}\n` +
        ` * ${outToken.symbol}: ${toToken}\n` +
        ` * ${outToken.network.currency}: ${toEth}`
      message = '```\n' + message + '\n```'
      await new TelegramBot(transfer.bridge.telegramToken, {
        polling: false
      }).sendMessage(transfer.bridge.telegramChatId, message, {
        parse_mode: 'Markdown'
      })

      await webhook.send({
        text: message
      })
    } catch (err) {
      console.log(err)
      this.loggerService.err('Message Send Failed', { transfer, type, err })
    }
  }

  private formatEtherForChat(
    num: BigNumberish,
    decimals: number,
    pad: number
  ): string {
    return ethers.formatUnits(num, decimals).padStart(pad)
  }
}
