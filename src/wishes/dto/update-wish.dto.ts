import { PartialType } from '@nestjs/mapped-types';
import { CreateWishDto } from './create-wish.dto';
import { IsNumber } from 'class-validator';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  @IsNumber()
  raised: number;
}
