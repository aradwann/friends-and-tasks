import { IsArray, IsString } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Status } from '../enums/status.enum';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  status: Status;

  @IsArray()
  assignees: number[]; // array of users IDs
}
