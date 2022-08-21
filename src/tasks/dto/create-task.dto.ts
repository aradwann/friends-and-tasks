import { IsArray, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  assignees: number[]; // array of users IDs
}
