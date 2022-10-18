import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Room } from '../entities/room.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomRepo: Repository<Room>,
  ) {}

  async create(room: Room, creator: User) {
    const newRoom = await this.addCreatorToRoom(room, creator);
    return this.roomRepo.save(room);
  }

  async addCreatorToRoom(room: Room, creator: User) {
    room.users.push(creator);
    return room;
  }

  getRoomsForUser(userId: number, pagination?: PaginationQueryDto) {
    const query = this.roomRepo
      .createQueryBuilder('room')
      .leftJoin('room.users', 'user')
      .where('user.id = :userId', { userId });

    return query;
  }
}
