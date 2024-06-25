import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Network } from './network.entity'
import { PoolV4 } from './pool-v4.entity'

@Entity('nft1155s')
export class Nft1155 extends BaseEntity {
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
    name: 'address',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  address: string

  @Column({
    name: 'imgUrl',
    type: 'varchar',
    length: 512,
    nullable: false
  })
  imgUrl: string

  @Column({
    name: 'tokenId',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  tokenId: string

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

  @ManyToOne(() => Network, network => network.nft1155s)
  @JoinColumn({
    name: 'networkId'
  })
  network?: Network

  @OneToMany(() => PoolV4, poolV4 => poolV4.stakingNft721)
  poolV4s?: PoolV4[]
}
