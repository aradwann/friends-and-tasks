import { User } from '../../users/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from '../enums/status.enum';

@Entity()
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: Status,
    nullable: true,
    default: Status.OPEN,
  })
  status: Status;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @ManyToOne(() => User, (user) => user.tasks_posted, {
    eager: true,
    onDelete: 'CASCADE', // if the assignor is the task is deleted, then the task is deleted
  })
  assignor: User;

  @ManyToMany(() => User, (user) => user.tasks_assigned_to_user, {
    eager: true,
  })
  @JoinTable()
  assignees: User[];
}
