import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { StatusEnum } from '../enums/status.enum';
import { Task } from './task.entity';

@Entity()
export class Status {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: StatusEnum,
    nullable: true,
    unique: true,
  })
  title: StatusEnum;

  @OneToMany(() => Task, (task) => task.status)
  tasks: Task[];
}
