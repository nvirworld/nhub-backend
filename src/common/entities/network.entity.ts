import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Nft1155 } from './nft-1155.entity'
import { Nft721 } from './nft-721.entity'
import { Pool } from './pool.entity'
import { Token } from './token.entity'

@Entity('networks')
export class Network extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int'
  })
  id: number

  @Column({
    name: 'chainId',
    type: 'int',
    nullable: false
  })
  chainId: number

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  name: string

  @Column({
    name: 'rpc',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  rpc: string

  @Column({
    name: 'scan',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  scan: string

  @Column({
    name: 'currency',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  currency: string

  @Column({
    name: 'iconUrl',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  iconUrl: string

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

  @OneToMany(() => Pool, pool => pool.network)
  pools?: Pool[]

  @OneToMany(() => Token, token => token.network)
  tokens?: Token[]

  @OneToMany(() => Nft1155, nft1155 => nft1155.network)
  nft1155s?: Nft1155[]

  @OneToMany(() => Nft721, nft721 => nft721.network)
  nft721s?: Nft721[]
}
