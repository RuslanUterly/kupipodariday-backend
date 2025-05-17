import { IsNotEmpty, IsString } from 'class-validator';

export class FindUsersDto {
  @IsNotEmpty()
  @IsString()
  query: string;
}
