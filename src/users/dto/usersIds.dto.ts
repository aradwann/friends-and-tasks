import { IsArray, IsNumber } from 'class-validator';

export class UsersIdsDto {
  @IsArray() // validate that it's an array
  @IsNumber({}, { each: true }) // validate that each value in the array is a number
  usersIds: number[];
}
