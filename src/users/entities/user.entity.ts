import * as bcrypt from 'bcrypt';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Task } from '../../tasks/entities/task.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { Workspace } from 'src/workspaces/entities/workspace.entity';
import { Room } from 'src/chat/entities/room.entity';
import { Message } from 'src/chat/entities/message.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsString()
  username: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  // doesn't return the password field with the user object
  // except when explicty selected with .addSelect('password') on QueryBuilder
  // this to protect  hashed password from being exposed within normal queries
  // @Column({ select: false })
  @Column({
    select: false,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @BeforeInsert()
  private async hashPassowrd() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @ManyToMany(() => Role, (role) => role.users)
  roles: Role[];

  @OneToMany(() => Task, (task) => task.assignor)
  tasks_posted: Task[];

  // tasks assigned to this user
  @ManyToMany(() => Task, (task) => task.assignees)
  tasks_assigned_to_user: Task[];

  @OneToMany(() => Workspace, (workspace) => workspace.creator)
  workspaces_created: Workspace[];

  // workspaces joined by the user
  @ManyToMany(() => Workspace, (workspace) => workspace.users)
  workspaces_joined: Workspace[];

  @ManyToMany(() => Room, (room) => room.users)
  rooms: Room[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];
}
