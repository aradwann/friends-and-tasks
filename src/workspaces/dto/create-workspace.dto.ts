import { IsString } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}
