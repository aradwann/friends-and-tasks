import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from 'src/tasks/entities/task.entity';

@Entity()
export class Workspace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @ManyToOne(() => User, (user) => user.workspaces_created, {
    eager: true,
    onDelete: 'CASCADE', // if the creator of the workspace is deleted, then the workspace is deleted
  })
  creator: User;

  @ManyToMany(() => User, (user) => user.workspaces_joined)
  @JoinTable()
  users: User[];

  @OneToMany(() => Task, (task) => task.assignor)
  tasks: Task[];
}
