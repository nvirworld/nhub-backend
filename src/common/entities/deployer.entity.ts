import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Bridge } from './bridge.entity'
import { Pool } from './pool.entity'

@Entity('deployers')
export class Deployer extends BaseEntity {
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
    name: 'address',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  address: string

  @Column({
    name: 'encryptedKey',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  encryptedKey: string

  @Column({
    name: 'salt',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  salt: string

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

  @OneToMany(() => Pool, pool => pool.deployer)
  pools?: Pool[]

  @OneToMany(() => Bridge, bridge => bridge.deployer)
  bridges?: Bridge[]
}
