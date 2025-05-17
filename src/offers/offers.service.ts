import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { User } from '../users/entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offersRepository: Repository<Offer>,
    @InjectRepository(Wish)
    private wishesRepository: Repository<Wish>,
  ) {}

  async create(dto: CreateOfferDto, user: User) {
    const wish = await this.wishesRepository.findOne({
      where: { id: dto.itemId },
      relations: ['owner', 'offers'],
    });

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    if (wish.owner.id === user.id) {
      throw new ForbiddenException('You cannot offer your own gift');
    }

    if (Number(wish.raised) + Number(dto.amount) > Number(wish.price)) {
      throw new BadRequestException('You cannot exceed the gift price');
    }

    wish.raised = Number(wish.raised) + Number(dto.amount);
    await this.wishesRepository.save(wish);

    const offer = this.offersRepository.create({
      amount: dto.amount,
      hidden: dto.hidden,
      user,
      item: wish,
    });

    return await this.offersRepository.save(offer);
  }

  async findOne(options: FindOneOptions<Offer>): Promise<Offer> {
    const offer = await this.offersRepository.findOne(options);

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }

  findOfferById(id: number): Promise<Offer> {
    return this.findOne({ where: { id }, relations: ['user', 'item'] });
  }

  findAll(): Promise<Offer[]> {
    return this.offersRepository.find({
      relations: ['user', 'item'],
    });
  }
}
