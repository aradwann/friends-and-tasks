import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { In, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async create(createUserDto: CreateUserDto) {
    // TODO check if the username or email is taken
    // with appropriate exception messages with a better method than the approach below

    // check if user exists with the given username
    const userUsername = await this.userRepo.findOneBy({
      username: createUserDto.username,
    });
    if (userUsername) {
      throw new BadRequestException(`username is already taken`);
    }
    // check if user exists with the given username
    const userEmail = await this.userRepo.findOneBy({
      email: createUserDto.email,
    });
    if (userEmail) {
      throw new BadRequestException(`email is already taken`);
    }
    const newUser = this.userRepo.create(createUserDto);
    return this.userRepo.save(newUser);
  }

  async findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.userRepo.find({ skip: offset, take: limit });
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOneBy({ id });

    // throw 404 error id user is not found
    if (!user) {
      throw new NotFoundException(`user with id ${id} is not found`);
    }
    return user;
  }

  async findOneByUsernameWithPassword(username: string) {
    const user = await this.userRepo.findOne({
      where: { username },
      select: ['id', 'username', 'password'],
    });

    // throw 404 error id user is not found
    if (!user) {
      throw new NotFoundException(
        `user with username ${username} is not found`,
      );
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    this.userRepo.update(id, updateUserDto);

    return this.userRepo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    return this.userRepo.remove(user);
  }

  async findUsersByIdArray(idArray: number[]) {
    const users = await this.userRepo.findBy({ id: In(idArray) });
    return users;
  }
}
