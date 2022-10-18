import { User } from 'src/users/entities/user.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToMany(() => User)
  @JoinTable()
  users: User[];

  @OneToOne(() => Workspace, (workspace) => workspace.room, {
    onDelete: 'CASCADE', // if workspace is deleted the workspace is deleted
  })
  @JoinColumn()
  workspace: Workspace;

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];
}
