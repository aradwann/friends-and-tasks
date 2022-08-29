import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Repository, In } from 'typeorm';
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
      relations: ['roles'],
    });

    // throw 404 error id user is not found
    if (!user) {
      throw new NotFoundException(
        `user with username ${username} is not found`,
      );
    }
    return user;
  }

  async findWorkspacesJoined(currentUser: User) {
    const user = await this.userRepo.findOne({
      where: { id: currentUser.id },
      select: ['id', 'username', 'password'],
      relations: ['workspaces_joined'],
    });
    return user.workspaces_joined;
  }

  async findWorkspacesCreate(currentUser: User) {
    const user = await this.userRepo.findOne({
      where: { id: currentUser.id },
      select: ['id', 'username', 'password'],
      relations: ['workspaces_created'],
    });
    return user.workspaces_created;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    return this.userRepo.update(id, updateUserDto);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    return this.userRepo.remove(user);
  }

  /**
   * find each user with the corresponding id in the id Array
   * Note: it returns distict users so even if the ids are repeated in the array
   *       it still returns an array of unique users
   * @param idsArray Array of users ids
   * @returns array of users found in the database
   */
  async findUsersByIdArray(idsArray: number[]) {
    const uniqueIdsSet = new Set(idsArray);
    const uniqueIdsArr = [...uniqueIdsSet];
    const users = await this.userRepo.findBy({ id: In(uniqueIdsArr) });

    // this is the same query but with using the query builder

    // const users = await this.userRepo
    //   .createQueryBuilder('user')
    //   .whereInIds(idsArray)
    //   .getMany();

    return users;
  }
}
