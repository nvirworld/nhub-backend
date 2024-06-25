import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm'
import { Pool } from './pool.entity'

@Entity('poolDeployLogs')
export class PoolDeployLog extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int'
  })
  id: number

  @Column({
    name: 'poolId',
    type: 'int',
    nullable: false
  })
  poolId: number

  @Column({
    name: 'message',
    type: 'text',
    nullable: false
  })
  message: string

  @Column({
    name: 'params',
    type: 'text',
    nullable: false
  })
  params: string

  @Column({
    name: 'level',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  level: 'info' | 'error'

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

  @ManyToOne(() => Pool, pool => pool.poolDeployLogs)
  @JoinColumn({
    name: 'poolId'
  })
  pool?: Pool
}
