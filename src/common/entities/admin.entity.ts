import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('admins')
export class Admin extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'int'
  })
  id: number

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true
  })
  email: string

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  name: string

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
    nullable: false
  })
  password: string

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
}
