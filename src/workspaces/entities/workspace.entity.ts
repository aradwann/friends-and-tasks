import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { Room } from 'src/chat/entities/room.entity';

@Entity()
export class Workspace {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
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

  @OneToOne(() => Room, (room) => room.workspace)
  room: Room;
}
