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

  @Column()
  password: string;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @BeforeInsert()
  async hashPassowrd() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // @ManyToMany(() => User[],() => {} )
  // @JoinTable()
  // friends: User[];
}
