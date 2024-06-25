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
import { PoolDeployLog } from './pool-deploy-log.entity'
import { Token } from './token.entity'

@Entity('pools')
export class Pool extends BaseEntity {
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

  @Column({
    name: 'whitelist',
    type: 'json',
    nullable: false
  })
  whitelist: string[] = []

  @Column({
    name: 'nftlist',
    type: 'json',
    nullable: false
  })
  nftlist: string[] = []

  @Column({
    name: 'nftImgUrl',
    type: 'varchar',
    length: 255,
    nullable: true
  })
  nftImgUrl: string | null

  @Column({
    name: 'isLocked',
    type: 'boolean',
    nullable: false,
    default: false
  })
  isLocked: boolean

  @Column({
    name: 'stakingTokenVolumeMin',
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: false
  })
  stakingTokenVolumeMin: string

  @Column({
    name: 'stakingTokenId',
    type: 'int',
    nullable: false
  })
  stakingTokenId: number

  @Column({
    name: 'rewardTokenVolume',
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: false
  })
  rewardTokenVolume: string

  @Column({
    name: 'rewardTokenId',
    type: 'int',
    nullable: false
  })
  rewardTokenId: number

  @Column({
    name: 'startedAt',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP'
  })
  startedAt: Date

  @Column({
    name: 'finishedAt',
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP'
  })
  finishedAt: Date

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
    name: 'unstakingEnabledAt',
    type: 'timestamp',
    nullable: true
  })
  unstakingEnabledAt: Date | null

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
  stakingToken?: Token

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

  @OneToMany(() => PoolDeployLog, poolDeployLog => poolDeployLog.pool)
  poolDeployLogs?: PoolDeployLog[]
}
