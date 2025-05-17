import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository, In, FindOneOptions } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { User } from '../users/entities/user.entity';
import { WishesService } from '../wishes/wishes.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistsRepository: Repository<Wishlist>,
    private wishesService: WishesService,
  ) {}

  async create(
    user: User,
    createWishlistDto: CreateWishlistDto,
  ): Promise<Wishlist> {
    const { itemsId, ...wishlistData } = createWishlistDto;

    const items = await this.wishesService.findAll({
      id: In(itemsId),
    });

    const saved = await this.wishlistsRepository.save(
      this.wishlistsRepository.create({
        ...wishlistData,
        owner: user,
        items,
      }),
    );

    return this.findOne({
      where: { id: saved.id },
      relations: ['owner', 'items'],
    });
  }

  async findOne(options: FindOneOptions<Wishlist>): Promise<Wishlist> {
    try {
      return this.wishlistsRepository.findOneOrFail(options);
    } catch {
      throw new NotFoundException('Wishlist not found');
    }
  }

  findById(id: number): Promise<Wishlist> {
    return this.findOne({ where: { id }, relations: ['owner', 'items'] });
  }

  findAll(): Promise<Wishlist[]> {
    return this.wishlistsRepository.find({
      relations: ['owner', 'items'],
      order: { id: 'ASC' },
    });
  }

  async updateOne(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    user: User,
  ): Promise<Wishlist> {
    const wishlist = await this.findOne({ where: { id } });

    if (wishlist.owner.id !== user.id) {
      throw new ForbiddenException('Access error');
    }

    await this.wishlistsRepository.update(id, updateWishlistDto);

    return await this.findOne({ where: { id } });
  }

  async removeOne(id: number, user: User): Promise<Wishlist> {
    const wishlist = await this.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });

    if (wishlist.owner.id !== user.id) {
      throw new ForbiddenException('Access error');
    }

    await this.wishlistsRepository.remove(wishlist);

    return wishlist;
  }
}
