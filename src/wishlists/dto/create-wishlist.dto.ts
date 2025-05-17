import { IsArray, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateWishlistDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  image: string;

  @IsArray()
  itemsId: string[];
}
