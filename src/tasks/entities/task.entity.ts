import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from './status.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';

@Entity()
export class Task {
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

  @ManyToOne(() => Status, (status) => status.tasks, {
    eager: true,
  })
  status: Status;

  @ManyToOne(() => User, (user) => user.tasks_posted, {
    eager: true,
    onDelete: 'CASCADE', // if the assignor of the task is deleted, then the task is deleted
  })
  assignor: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.tasks, {
    eager: true,
    onDelete: 'CASCADE', // if the workspace of the task is deleted, then the task is deleted
  })
  workspace: Workspace;

  @ManyToMany(() => User, (user) => user.tasks_assigned_to_user, {
    eager: true,
  })
  @JoinTable()
  assignees: User[];
}
