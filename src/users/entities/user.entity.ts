import * as bcrypt from 'bcrypt';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  // doesn't return the password field with the user object
  // except when explicty selected with .addSelect('password') on QueryBuilder
  // this to protect  hashed password from being exposed within normal queries
  // @Column({ select: false })
  @Column()
  password: string;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @BeforeInsert()
  private async hashPassowrd() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // @ManyToMany(() => User[],() => {} )
  // @JoinTable()
  // friends: User[];
}
