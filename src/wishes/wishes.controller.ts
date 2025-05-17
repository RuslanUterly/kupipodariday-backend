import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { JwtGuard } from '../auth/guards/jwt-guard';
import { RequestWithUser } from '../shared/types';
import { CreateWishDto } from './dto/create-wish.dto';
import { Wish } from './entities/wish.entity';
import { UpdateWishDto } from './dto/update-wish.dto';
import { SensitiveDataInterceptor } from '../shared/interceptors/sensitive-data';

@Controller('wishes')
@UseInterceptors(SensitiveDataInterceptor)
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Get('top')
  getTopWishes(): Promise<Wish[]> {
    return this.wishesService.getTopWishes();
  }

  @Get('last')
  getLastWishes(): Promise<Wish[]> {
    return this.wishesService.getLastWishes();
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  getWishById(@Param('id') id: number): Promise<Wish> {
    return this.wishesService.findWishById(id);
  }

  @UseGuards(JwtGuard)
  @Post()
  create(
    @Req() { user }: RequestWithUser,
    @Body() createWithDto: CreateWishDto,
  ): Promise<Wish> {
    return this.wishesService.create(createWithDto, user);
  }

  @UseGuards(JwtGuard)
  @Patch(':id')
  updateWishById(
    @Req() { user }: RequestWithUser,
    @Param('id') id: number,
    @Body() updateWithDto: UpdateWishDto,
  ) {
    return this.wishesService.updateWish(id, updateWithDto, user);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  deleteWishById(@Req() { user }: RequestWithUser, @Param('id') id: number) {
    return this.wishesService.removeWish(id, user);
  }

  @UseGuards(JwtGuard)
  @Post(':id/copy')
  copyWishById(
    @Req() { user }: RequestWithUser,
    @Param('id') id: number,
  ): Promise<Wish> {
    return this.wishesService.copyWish(id, user);
  }
}
