import * as bcrypt from 'bcrypt';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Task } from 'src/tasks/entities/task.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';

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

  @OneToMany(() => Task, (task) => task.assignor)
  tasks: Task[];

  // @ManyToMany(() => User[],() => {} )
  // @JoinTable()
  // friends: User[];
}
