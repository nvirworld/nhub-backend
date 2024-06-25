import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Deployer } from './deployer.entity'
import { Network } from './network.entity'
import { Nft1155 } from './nft-1155.entity'
import { Nft721 } from './nft-721.entity'
import { PoolV4DeployLog } from './pool-v4-deploy-log.entity'
import { Token } from './token.entity'

@Entity('poolV4s')
export class PoolV4 extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int'
  })
  id: number

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  name: string

  @Column({
    name: 'memo',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  memo: string

  @Column({
    name: 'networkId',
    type: 'int',
    nullable: false
  })
  networkId: number

  @Column({
    name: 'deployerId',
    type: 'int',
    nullable: false
  })
  deployerId: number

  @Column({
    name: 'address',
    type: 'varchar',
    length: 255,
    nullable: true
  })
  address: string | null

  // constructor
  @Column({
    name: 'startedAt',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP'
  })
  startedAt: Date

  @Column({
    name: 'endedAt',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP'
  })
  endedAt: Date

  @Column({
    name: 'withdrawEnabledAt',
    type: 'timestamp',
    nullable: false
  })
  withdrawEnabledAt: Date

  @Column({
    name: 'stakingTokenId',
    type: 'int',
    nullable: true
  })
  stakingTokenId: number | null

  @Column({
    name: 'stakingNft721Id',
    type: 'int',
    nullable: true
  })
  stakingNft721Id: number | null

  @Column({
    name: 'stakingNft1155Id',
    type: 'int',
    nullable: true
  })
  stakingNft1155Id: number | null

  @Column({
    name: 'sharePerNft',
    type: 'int',
    nullable: false,
    default: 0
  })
  sharePerNft: number

  @Column({
    name: 'rewardTokenId',
    type: 'int',
    nullable: false
  })
  rewardTokenId: number

  @Column({
    name: 'stakingTokenMax',
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: false,
    default: 0
  })
  stakingTokenMax: string

  @Column({
    name: 'stakingNftMax',
    type: 'int',
    nullable: false,
    default: 0
  })
  stakingNftMax: number

  @Column({
    name: 'stakingTokenMin',
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: false,
    default: 0
  })
  stakingTokenMin: string

  @Column({
    name: 'stakingNftMin',
    type: 'int',
    nullable: false,
    default: 0
  })
  stakingNftMin: number

  @Column({
    name: 'whitelist',
    type: 'json',
    nullable: false
  })
  whitelist: string[] = []

  @Column({
    name: 'rewardTokenVolume',
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: false
  })
  rewardTokenVolume: string

  @Column({
    name: 'deployedAt',
    type: 'timestamp',
    nullable: true
  })
  deployedAt: Date | null

  @Column({
    name: 'notifiedAt',
    type: 'timestamp',
    nullable: true
  })
  notifiedAt: Date | null

  @Column({
    name: 'activatedAt',
    type: 'timestamp',
    nullable: true
  })
  activatedAt: Date | null

  @Column({
    name: 'createdAt',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date

  @Column({
    name: 'updatedAt',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP'
  })
  updatedAt: Date

  @ManyToOne(() => Network, network => network.pools)
  @JoinColumn({
    name: 'networkId'
  })
  network?: Network

  @ManyToOne(() => Token, token => token.stakingPools)
  @JoinColumn({
    name: 'stakingTokenId'
  })
  stakingToken?: Token | null

  @ManyToOne(() => Token, token => token.rewardPools)
  @JoinColumn({
    name: 'rewardTokenId'
  })
  rewardToken?: Token

  @ManyToOne(() => Deployer, deployer => deployer.pools)
  @JoinColumn({
    name: 'deployerId'
  })
  deployer?: Deployer

  @ManyToOne(() => Nft721, nft721 => nft721.poolV4s)
  @JoinColumn({
    name: 'stakingNft721Id'
  })
  stakingNft721: Nft721 | null

  @ManyToOne(() => Nft1155, nft1155 => nft1155.poolV4s)
  @JoinColumn({
    name: 'stakingNft1155Id'
  })
  stakingNft1155: Nft1155 | null

  @OneToMany(() => PoolV4DeployLog, poolV4DeployLog => poolV4DeployLog.poolV4)
  poolV4DeployLogs?: PoolV4DeployLog[]
}
