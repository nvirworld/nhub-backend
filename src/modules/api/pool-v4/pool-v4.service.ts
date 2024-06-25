import { APP } from '@/app.config'
import * as PoolV4Abi from '@/common/abi/poolv4.abi.json'
import { TokenPrice } from '@/common/entities/token-price.entity'
import { LoggerService } from '@/common/logger'
import { PoolV4Repository } from '@/modules/api/pool-v4/pool-v4.repository'
import { Poolv4Abi__factory } from '@/typechain-types'
import { HttpService } from '@nestjs/axios'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { ethers } from 'ethers'
import { sum } from 'lodash'
import { encode } from 'node:querystring'
import { firstValueFrom } from 'rxjs'
import { OpenSeaNftItem, OpenSeaResponse } from './dto/nft-list.dto'
import { PoolModuleOptions, POOL_MODULE_OPTIONS } from './pool-v4.interface'

@Injectable()
export class PoolV4Service {
  private readonly openSeaEndPoint: string
  private readonly openSeaEndPointTestnet: string

  constructor(
    @Inject(POOL_MODULE_OPTIONS)
    private readonly poolModuleOptions: PoolModuleOptions,
    private readonly poolRepository: PoolV4Repository,
    private readonly httpService: HttpService,
    private readonly loggerService: LoggerService
  ) {
    this.openSeaEndPoint = 'https://api.opensea.io'
    this.openSeaEndPointTestnet = 'https://testnets-api.opensea.io'
  }

  async getPools() {
    return await this.poolRepository.findActivePools()
  }

  async getTotalValueLocked() {
    const pools = await this.poolRepository.findPoolsWithActivationHistory()
    const tokenPrices = await TokenPrice.find({
      where: {
        currency: 'USD'
      }
    })

    const tasks = pools.map(async pool => {
      const stakingToken = pool.stakingToken
      const symbol = stakingToken?.symbol ?? ''
      const tokenPrice = tokenPrices.find(tp => tp.tokenId === stakingToken?.id)
      const usd = tokenPrice != null ? Number(tokenPrice.price) : 0
      const fetchRequest = new ethers.FetchRequest(pool.network.rpc)
      fetchRequest.setHeader('Origin', APP.SITE)
      const provider = new ethers.JsonRpcProvider(fetchRequest)
      if (pool.address == null) {
        return {
          symbol,
          usd,
          amount: 0
        }
      }
      const poolContract = Poolv4Abi__factory.connect(pool.address, provider)
      return {
        symbol,
        usd,
        amount: Number(
          ethers.formatUnits(
            await poolContract.poolTokenAmount(),
            stakingToken?.decimals ?? 18
          )
        )
      }
    })

    return await Promise.all(tasks)
  }

  async getTotalRevenueLocked() {
    const pools = await this.poolRepository.findFinishedPoolsTotalReward()
    const tokenPrices = await TokenPrice.find({
      where: {
        currency: 'USD'
      }
    })
    return pools.map(pool => {
      const symbol = pool.rewardToken?.symbol ?? ''
      const tokenPrice = tokenPrices.find(
        tp => tp.tokenId === pool.rewardToken?.id
      )
      const usd = tokenPrice != null ? Number(tokenPrice.price) : 0
      return {
        symbol,
        usd,
        amount: Number(pool.rewardTokenVolume)
      }
    })
  }

  async getTotalNFTLocked(): Promise<number> {
    const pools = await this.poolRepository.findPoolsWithActivationHistory()
    const tasks = pools.map(async pool => {
      const fetchRequest = new ethers.FetchRequest(pool.network.rpc)
      fetchRequest.setHeader('Origin', APP.SITE)
      const provider = new ethers.JsonRpcProvider(fetchRequest)
      if (pool.address == null) {
        return 0
      }
      const poolContract = Poolv4Abi__factory.connect(pool.address, provider)
      return (
        (await poolContract.poolNft721Amount()) +
        (await poolContract.poolNft1155Amount())
      )
    })

    const totalSupplies = await Promise.all(tasks)
    return Number(sum(totalSupplies).toString())
  }

  async getPool(id: number) {
    const pool = await this.poolRepository.findOneActivePool(id)
    if (pool == null) {
      throw new BadRequestException('Pool not found')
    }
    return pool
  }

  async getPoolNftList(id: number, accountAddress: string) {
    const pool = await this.getPool(id)
    const nft721 = pool.stakingNft721
    if (nft721 == null) {
      throw new BadRequestException('Pool not support nft721')
    }

    const nfts = await this.getAllNftsByAccountAddress(
      pool.network.chainId,
      accountAddress,
      nft721.address,
      3
    )

    const fetchRequest = new ethers.FetchRequest(pool.network.rpc)
    fetchRequest.setHeader('Origin', APP.SITE)
    const provider = new ethers.JsonRpcProvider(fetchRequest)
    const poolContract = new ethers.Contract(pool.address, PoolV4Abi, {
      provider
    })

    const poolNfts = await this.getAllNftsByAccountAddress(
      pool.network.chainId,
      pool.address,
      nft721.address
    )
    let stakedNfts: OpenSeaNftItem[] = []
    try {
      const [, , stakedTokenIds] = await poolContract.getPosition(
        accountAddress.toLowerCase()
      )

      stakedNfts = poolNfts.filter(nft => {
        return (
          stakedTokenIds.filter(id => id.toString() === nft.identifier).length >
          0
        )
      })
    } catch (err) {
      this.loggerService.err('stakedNfts', { err })
    }

    return { nfts, stakedNfts, nft721 }
  }

  private async getAllNftsByAccountAddress(
    chainId: number,
    accountAddress: string,
    nftAddress: string,
    limit?: number
  ) {
    let nfts: OpenSeaNftItem[] = []
    let count = 0
    try {
      let next: string | undefined
      while (true) {
        const response = await this.getNftsByAccountAddress(
          chainId,
          accountAddress,
          next
        )

        nfts = nfts.concat(
          response.nfts.filter(
            nft =>
              nft.contract.toLowerCase() === nftAddress.toLowerCase() &&
              !nft.is_disabled
          )
        )

        next = response.next

        if (next == null) {
          break
        }
        if (limit != null && ++count > limit) {
          break
        }
      }
    } catch (err) {
      this.loggerService.err('getAllNftsByAccountAddress', { err })
    }

    return nfts
  }

  private async getNftsByAccountAddress(
    chainId: number,
    accountAddress: string,
    next?: string
  ) {
    let chainName = ''
    let testnet = false
    switch (chainId) {
      case 42161:
        chainName = 'arbitrum'
        break
      case 421613:
        chainName = 'arbitrum_goerli'
        testnet = true
        break
      case 42170:
        chainName = 'arbitrum_nova'
        break
      case 43114:
        chainName = 'avalanche'
        break
      case 43113:
        chainName = 'avalanche_fuji'
        testnet = true
        break
      case 1001:
        chainName = 'baobab'
        testnet = true
        break
      case 8453:
        chainName = 'base'
        break
      case 84531:
        chainName = 'base_goerli'
        testnet = true
        break
      case 56:
        chainName = 'bsc'
        break
      case 97:
        chainName = 'bsctestnet'
        testnet = true
        break
      case 1:
        chainName = 'ethereum'
        break
      case 5:
        chainName = 'goerli'
        testnet = true
        break
      case 8217:
        chainName = 'klaytn'
        break
      case 137:
        chainName = 'matic'
        break
      case 80001:
        chainName = 'mumbai'
        break
      case 69:
        chainName = 'optimism'
        break
      case 420:
        chainName = 'optimism_goerli'
        testnet = true
        break
      case 11155111:
        chainName = 'sepolia'
        testnet = true
        break
    }
    const qs = {
      limit: 50,
      next
    }
    const endPoint: string = testnet
      ? this.openSeaEndPointTestnet
      : this.openSeaEndPoint

    const url = `${endPoint}/api/v2/chain/${chainName}/account/${accountAddress}/nfts?${encode(
      qs
    )}`

    const config: Record<string, any> = {}
    if (!testnet) {
      config.headers = {
        'x-api-key': this.poolModuleOptions.openSeaApiKey
      }
    }
    const { data } = await firstValueFrom(
      this.httpService.get<OpenSeaResponse>(url, config)
    )
    return data
  }
}
