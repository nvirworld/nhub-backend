import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Bridge } from './bridge.entity'
import { Network } from './network.entity'
import { Pool } from './pool.entity'
import { TokenPrice } from './token-price.entity'

@Entity('tokens')
export class Token extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int'
  })
  id: number

  @Column({
    name: 'networkId',
    type: 'int',
    nullable: false
  })
  networkId: number

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  name: string

  @Column({
    name: 'iconUrl',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  iconUrl: string

  @Column({
    name: 'symbol',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  symbol: string

  @Column({
    name: 'address',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  address: string

  @Column({
    name: 'decimals',
    type: 'int',
    nullable: false
  })
  decimals: number

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

  @ManyToOne(() => Network, network => network.tokens)
  @JoinColumn({
    name: 'networkId'
  })
  network?: Network

  @OneToMany(() => TokenPrice, tokenPrice => tokenPrice.token)
  tokenPrices?: TokenPrice[]

  @OneToMany(() => Pool, pool => pool.stakingToken)
  stakingPools?: Pool[]

  @OneToMany(() => Pool, pool => pool.rewardToken)
  rewardPools?: Pool[]

  @OneToMany(() => Bridge, bridge => bridge.inToken)
  inBridges?: Bridge[]

  @OneToMany(() => Bridge, bridge => bridge.outToken)
  outBridges?: Bridge[]
}
