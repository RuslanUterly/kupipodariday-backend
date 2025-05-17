import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt-guard';
import { OffersService } from './offers.service';
import { Offer } from './entities/offer.entity';
import { RequestWithUser } from '../shared/types';
import { CreateOfferDto } from './dto/create-offer.dto';
import { SensitiveDataInterceptor } from '../shared/interceptors/sensitive-data';

@UseGuards(JwtGuard)
@Controller('offers')
@UseInterceptors(SensitiveDataInterceptor)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  async getAllOffers(): Promise<Offer[]> {
    return this.offersService.findAll();
  }

  @Get(':id')
  async getOfferById(@Param('id') id: number) {
    return this.offersService.findOfferById(id);
  }

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createWithDto: CreateOfferDto,
  ) {
    return await this.offersService.create(createWithDto, req.user);
  }
}
