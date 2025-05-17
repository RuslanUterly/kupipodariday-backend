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
import { JwtGuard } from '../auth/guards/jwt-guard';
import { WishlistsService } from './wishlists.service';
import { RequestWithUser } from '../shared/types';
import { Wishlist } from './entities/wishlist.entity';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { SensitiveDataInterceptor } from 'src/shared/interceptors/sensitive-data';

@UseGuards(JwtGuard)
@Controller('wishlistlists')
@UseInterceptors(SensitiveDataInterceptor)
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  getAllWishlists(): Promise<Wishlist[]> {
    return this.wishlistsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Wishlist> {
    return this.wishlistsService.findById(id);
  }

  @Post()
  create(
    @Req() { user }: RequestWithUser,
    @Body() dto: CreateWishlistDto,
  ): Promise<Wishlist> {
    return this.wishlistsService.create(user, dto);
  }

  @Patch(':id')
  updateWishlistById(
    @Req() { user }: RequestWithUser,
    @Param('id') id: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    return this.wishlistsService.updateOne(id, updateWishlistDto, user);
  }

  @Delete(':id')
  deleteWishlistById(
    @Req() { user }: RequestWithUser,
    @Param('id') id: number,
  ): Promise<Wishlist> {
    return this.wishlistsService.removeOne(id, user);
  }
}
