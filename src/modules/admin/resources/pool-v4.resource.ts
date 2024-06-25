import { APP } from '@/app.config'
import * as PoolV4Abi from '@/common/abi/poolv4.abi.json'
import * as PoolV4Bytecode from '@/common/abi/poolv4.bytecode.json'
import { decryptAES } from '@/common/crypto'
import { Deployer } from '@/common/entities/deployer.entity'
import { Network } from '@/common/entities/network.entity'
import { Nft1155 } from '@/common/entities/nft-1155.entity'
import { Nft721 } from '@/common/entities/nft-721.entity'
import { PoolV4DeployLog } from '@/common/entities/pool-v4-deploy-log.entity'
import { PoolV4 } from '@/common/entities/pool-v4.entity'
import { Token } from '@/common/entities/token.entity'
import { LoggerService } from '@/common/logger'
import { Components } from '@/modules/admin/components'
import {
  ResourceInterface,
  ResourceModuleOptions,
  RESOURCE_MODULE_OPTIONS
} from '@/modules/admin/resources/resource.interface'
import { Erc20Abi__factory } from '@/typechain-types/factories/Erc20Abi__factory'
import { Poolv4Abi__factory } from '@/typechain-types/factories/Poolv4Abi__factory'
import { Inject, Injectable } from '@nestjs/common'
import {
  ActionContext,
  Before,
  ResourceWithOptions,
  ValidationError
} from 'adminjs'
import { ethers } from 'ethers'
import jsonStringify from 'fast-safe-stringify'

@Injectable()
export class PoolV4Resource implements ResourceInterface {
  constructor(
    @Inject(RESOURCE_MODULE_OPTIONS)
    private readonly resourceModuleOptions: ResourceModuleOptions,
    private readonly loggerService: LoggerService
  ) {}

  async getResource(): Promise<ResourceWithOptions> {
    return {
      resource: PoolV4,
      options: {
        navigation: {
          name: 'Pool',
          icon: 'Money'
        },
        actions: {
          edit: {
            isAccessible: (context: ActionContext) => {
              return context.record?.params.deployedAt == null
            },
            before: this.beforeSaveHook
          },
          new: {
            before: this.beforeSaveHook
          },
          deploy: {
            actionType: 'record',
            component: false,
            icon: 'StoragePool',
            isAccessible: (context: ActionContext) => {
              return context.record?.params.deployedAt == null
            },
            handler: async (request, response, context) => {
              const { record, currentAdmin } = context
              if (record == null) {
                throw new Error('record is null')
              }
              try {
                record.params = await this.deploy(record.params.id)
                return {
                  record: record.toJSON(currentAdmin)
                }
              } catch (err) {
                return {
                  record: record.toJSON(currentAdmin),
                  notice: {
                    type: 'error',
                    message: err.message
                  }
                }
              }
            }
          },
          notify: {
            actionType: 'record',
            component: false,
            icon: 'StoragePool',
            isAccessible: (context: ActionContext) => {
              return (
                context.record?.params.deployedAt != null &&
                context.record?.params.notifiedAt == null
              )
            },
            handler: async (request, response, context) => {
              const { record, currentAdmin } = context
              if (record == null) {
                throw new Error('record is null')
              }
              try {
                record.params = await this.notify(record.params.id)
                return {
                  record: record.toJSON(currentAdmin)
                }
              } catch (err) {
                return {
                  record: record.toJSON(currentAdmin),
                  notice: {
                    type: 'error',
                    message: err.message
                  }
                }
              }
            }
          },
          activate: {
            actionType: 'record',
            component: false,
            icon: 'Power',
            isAccessible: (context: ActionContext) => {
              return (
                context.record?.params.deployedAt != null &&
                context.record?.params.notifiedAt != null &&
                context.record?.params.activatedAt == null &&
                context.record?.params.address != null
              )
            },
            handler: async (request, response, context) => {
              const { record, currentAdmin } = context
              if (record != null) {
                record.params = await this.activate(record.params.id, true)
              }
              return {
                record: record?.toJSON(currentAdmin),
                msg: 'Hello world'
              }
            }
          },
          deactivate: {
            actionType: 'record',
            component: false,
            icon: 'Power',
            isAccessible: (context: ActionContext) => {
              return context.record?.params.activatedAt != null
            },
            handler: async (request, response, context) => {
              const { record, currentAdmin } = context
              if (record != null) {
                record.params = await this.activate(record.params.id, false)
              }
              return {
                record: record?.toJSON(currentAdmin),
                msg: 'Hello world'
              }
            }
          }
        },
        properties: {
          whitelist: {
            type: 'string',
            isArray: true
          },
          address: {
            components: {
              list: Components.Scanlink
            }
          },
          stakingTokenMin: {
            components: {
              list: Components.Decimal
            }
          },
          stakingTokenMax: {
            components: {
              list: Components.Decimal
            }
          },
          rewardTokenVolume: {
            components: {
              list: Components.Decimal
            }
          }
        },
        listProperties: [
          'id',
          'name',
          'address',
          'networkId',
          'createdAt',
          'memo'
        ],
        editProperties: [
          'name',
          'networkId',
          'deployerId',
          'memo',
          'startedAt',
          'endedAt',
          'withdrawEnabledAt',
          'stakingTokenId',
          'stakingNft721Id',
          'stakingNft1155Id',
          'rewardTokenId',
          'stakingTokenMax',
          'stakingTokenMin',
          'whitelist',
          'rewardTokenVolume'
        ],
        sort: {
          sortBy: 'id',
          direction: 'desc'
        }
      }
    }
  }

  beforeSaveHook: Before = (request, context) => {
    const { payload = {}, method } = request
    if (method !== 'post') return request

    const errors: Record<string, { message: string }> = {}

    if (payload.stakingNft721Id != null && payload.stakingNft1155Id != null) {
      errors.nft721Id = {
        message: 'Please enter only one of 721 or 1155 ID.'
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors)
    }

    payload.sharePerNft =
      (payload.stakingNft721Id != null || payload.stakingNft1155Id != null) &&
      payload.stakingTokenId == null
        ? 1
        : 0
    payload.stakingNftMax = 0
    payload.stakingNftMin =
      payload.stakingNft721Id == null && payload.stakingNft1155Id == null
        ? 0
        : 1

    return request
  }

  private async logging(
    poolV4Id: number,
    level: 'info' | 'error',
    message: string,
    params: any
  ) {
    await PoolV4DeployLog.insert({
      poolV4Id,
      level,
      message,
      params: jsonStringify(params)
    })
    if (level === 'info') {
      this.loggerService.info(message, params)
    } else {
      this.loggerService.err(message, params)
    }
  }

  private async getPoolInfos(id: number) {
    const pool = (await PoolV4.findOneOrFail({
      where: { id },
      relations: {
        deployer: true,
        network: true,
        stakingToken: true,
        rewardToken: true,
        stakingNft721: true,
        stakingNft1155: true
      }
    })) as PoolV4 & {
      deployer: Deployer
      network: Network
      stakingToken: Token | null
      rewardToken: Token
      stakingNft721: Nft721 | null
      stakingNft1155: Nft1155 | null
    }

    const { network, deployer } = pool

    const fetchRequest = new ethers.FetchRequest(network.rpc)
    fetchRequest.setHeader('Origin', APP.SITE)
    const provider = new ethers.JsonRpcProvider(fetchRequest)
    const deployerWallet = new ethers.Wallet(
      decryptAES(
        deployer.encryptedKey,
        deployer.salt,
        this.resourceModuleOptions.aesSecretKey
      ),
      provider
    )

    return { pool, deployerWallet }
  }

  private async deploy(id: number) {
    try {
      const { pool, deployerWallet } = await this.getPoolInfos(id)

      const { stakingToken, rewardToken } = pool

      // 1. deploy
      const factory = new ethers.ContractFactory(
        PoolV4Abi,
        PoolV4Bytecode.bytecode,
        deployerWallet
      )
      const startTs = Math.floor(pool.startedAt.getTime() / 1000)
      const endTs = Math.floor(pool.endedAt.getTime() / 1000)
      const withdrawEnableTs = Math.floor(
        pool.withdrawEnabledAt.getTime() / 1000
      )
      const deployArgs = [
        pool.name,
        [startTs, endTs, withdrawEnableTs],
        stakingToken?.address ?? ethers.ZeroAddress,
        pool.stakingNft721?.address ?? ethers.ZeroAddress,
        pool.stakingNft1155?.address ?? ethers.ZeroAddress,
        pool.stakingNft1155?.tokenId ?? 0,
        ethers.parseUnits(
          pool.sharePerNft.toString(),
          stakingToken?.decimals ?? 18
        ),
        rewardToken.address,
        [
          ethers.parseUnits(pool.stakingTokenMax, stakingToken?.decimals ?? 18),
          pool.stakingNftMax,
          ethers.parseUnits(pool.stakingTokenMin, stakingToken?.decimals ?? 18),
          pool.stakingNftMin
        ],
        pool.whitelist
      ]
      await this.logging(id, 'info', '[deploy] [before] [try] deploy', {
        pool,
        deployArgs
      })
      const poolContractResult = await factory.deploy(...deployArgs)
      await poolContractResult.waitForDeployment()

      const poolAddress =
        typeof poolContractResult.target === 'string'
          ? poolContractResult.target
          : await poolContractResult.getAddress()

      await this.logging(id, 'info', '[deploy] [after] [done] deploy', {
        pool,
        poolAddress
      })

      pool.address = poolAddress
      pool.deployedAt = new Date()
      return await pool.save()
    } catch (err) {
      await this.logging(id, 'error', '[deploy] deploy error', {
        err: JSON.stringify(err, Object.getOwnPropertyNames(err))
      })
      throw err
    }
  }

  private async notify(id: number) {
    try {
      const { pool, deployerWallet } = await this.getPoolInfos(id)

      const poolAddress = pool.address

      if (poolAddress == null) {
        throw new Error('pool not deployed')
      }

      const poolContract = Poolv4Abi__factory.connect(
        poolAddress,
        deployerWallet
      )

      const rewardTokenContract = Erc20Abi__factory.connect(
        pool.rewardToken.address,
        deployerWallet
      )

      // 1. deployer reward amount check
      await this.logging(
        id,
        'info',
        '[deploy] [before] deployer reward amount check',
        {
          pool
        }
      )
      const balanceOf = await rewardTokenContract.balanceOf(
        deployerWallet.address
      )

      await this.logging(
        id,
        'info',
        '[deploy] [after] deployer reward amount check',
        {
          pool,
          balanceOf: balanceOf.toString()
        }
      )

      if (
        balanceOf <
        ethers.parseUnits(pool.rewardTokenVolume, pool.rewardToken.decimals)
      ) {
        throw new Error(
          `insufficient balance [token=${pool.rewardToken.symbol}]`
        )
      }

      // 2. approve
      const rewardTokenVolume = pool.rewardTokenVolume
      await this.logging(id, 'info', '[notify] [before] approve', {
        pool,
        poolAddress,
        rewardTokenVolume
      })

      const approveResult = await rewardTokenContract.approve(
        poolAddress,
        ethers
          .parseUnits(rewardTokenVolume, pool.rewardToken.decimals)
          .toString()
      )

      await approveResult.wait()

      await this.logging(id, 'info', '[notify] [after] approve', {
        pool,
        approveResult
      })

      // 3. addRewards
      const rewardTokenVolumeWei = ethers
        .parseUnits(rewardTokenVolume, pool.rewardToken.decimals)
        .toString()

      await this.logging(id, 'info', '[notify] [before] addRewards', {
        pool,
        rewardTokenVolumeWei
      })
      const notifyRewardAmountResult = await poolContract.addRewards(
        rewardTokenVolumeWei
      )
      await notifyRewardAmountResult.wait()
      await this.logging(id, 'info', '[notify] [after] addRewards', {
        pool,
        notifyRewardAmountResult
      })

      pool.notifiedAt = new Date()
      return await pool.save()
    } catch (err) {
      await this.logging(id, 'error', '[notify] notify error', {
        err: JSON.stringify(err, Object.getOwnPropertyNames(err))
      })
      throw err
    }
  }

  private async activate(id: number, isActivate: boolean) {
    const pool = await PoolV4.findOne({
      where: { id }
    })

    if (pool == null) {
      throw new Error('Pool not found')
    }

    if (isActivate) {
      pool.activatedAt = new Date()
    } else {
      pool.activatedAt = null
    }
    return await pool.save()
  }
}
