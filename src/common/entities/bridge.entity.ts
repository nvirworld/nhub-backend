import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Deployer } from './deployer.entity'
import { Token } from './token.entity'

@Entity('bridges')
export class Bridge extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int'
  })
  id: number

  @Column({
    name: 'deployerId',
    type: 'int',
    nullable: false
  })
  deployerId: number

  @Column({
    name: 'distributorAddress',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  distributorAddress: string

  @Column({
    name: 'minimum',
    type: 'double',
    nullable: false
  })
  minimum: number

  @Column({
    name: 'feeFixed',
    type: 'double',
    nullable: false
  })
  feeFixed: number

  @Column({
    name: 'feeRate',
    type: 'double',
    nullable: false
  })
  feeRate: number

  @Column({
    name: 'inTokenId',
    type: 'int',
    nullable: false
  })
  inTokenId: number

  @Column({
    name: 'outTokenId',
    type: 'int',
    nullable: false
  })
  outTokenId: number

  @Column({
    name: 'telegramToken',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  telegramToken: string

  @Column({
    name: 'telegramChatId',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  telegramChatId: string

  @Column({
    name: 'lastBlock',
    type: 'int',
    nullable: false
  })
  lastBlock: number

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

  @ManyToOne(() => Deployer, deployer => deployer.bridges)
  @JoinColumn({
    name: 'deployerId'
  })
  deployer?: Deployer

  @ManyToOne(() => Token, token => token.inBridges)
  @JoinColumn({
    name: 'inTokenId'
  })
  inToken?: Token

  @ManyToOne(() => Token, token => token.outBridges)
  @JoinColumn({
    name: 'outTokenId'
  })
  outToken?: Token
}
