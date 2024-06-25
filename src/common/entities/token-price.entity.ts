import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique
} from 'typeorm'
import { Token } from './token.entity'

@Entity('tokenPrices')
@Unique(['tokenId', 'currency'])
export class TokenPrice extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int'
  })
  id: number

  @Column({
    name: 'tokenId',
    type: 'int',
    nullable: false
  })
  tokenId: number

  @Column({
    name: 'currency',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  currency: string

  @Column({
    name: 'price',
    type: 'decimal',
    precision: 30,
    scale: 18,
    nullable: false
  })
  price: string

  @Column({
    name: 'renewedAt',
    type: 'timestamp',
    nullable: false
  })
  renewedAt: Date

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

  @ManyToOne(() => Token, token => token.tokenPrices)
  @JoinColumn({
    name: 'tokenId'
  })
  token?: Token
}
