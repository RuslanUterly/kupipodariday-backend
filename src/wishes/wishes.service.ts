import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishesRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, user: User): Promise<Wish> {
    const { id } = await this.wishesRepository.save(
      this.wishesRepository.create({ ...createWishDto, owner: user }),
    );

    return await this.findOne({
      where: { id },
      relations: ['owner'],
    });
  }

  async findOne(options: FindOneOptions<Wish>): Promise<Wish> {
    const wish = await this.wishesRepository.findOne(options);

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    return wish;
  }

  findAll(options: FindOptionsWhere<Wish>): Promise<Wish[]> {
    return this.wishesRepository.findBy(options);
  }

  getTopWishes(): Promise<Wish[]> {
    return this.wishesRepository.find({
      order: {
        copied: 'DESC',
      },
      take: 20,
      relations: {
        owner: true,
        offers: false,
      },
    });
  }

  getLastWishes(): Promise<Wish[]> {
    return this.wishesRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 40,
      relations: {
        owner: true,
        offers: false,
      },
    });
  }

  findWishById(id: number): Promise<Wish> {
    return this.findOne({
      where: { id },
      relations: ['owner', 'offers'],
    });
  }

  async updateWish(id: number, dto: UpdateWishDto, user: User) {
    const wish = await this.wishesRepository.findOne({
      where: { id },
      relations: ['owner', 'offers'],
    });

    if (!wish) {
      throw new NotFoundException('Gift not found');
    }

    if (wish.owner.id !== user.id) {
      throw new ForbiddenException('Access error');
    }

    if (wish.offers?.length) {
      throw new ForbiddenException('You cannot edit a suggested gift');
    }

    Object.assign(wish, dto);
    return this.wishesRepository.save(wish);
  }

  async removeWish(id: number, user: User) {
    const wish = await this.wishesRepository.findOne({
      where: { id },
      relations: ['owner', 'offers'],
    });

    if (!wish) {
      throw new NotFoundException('Gift not found');
    }

    if (wish.owner.id !== user.id) {
      throw new ForbiddenException('Access error');
    }

    return this.wishesRepository.delete(id);
  }
  async copyWish(id: number, user: User): Promise<Wish> {
    const wish = await this.findOne({ where: { id } });
    const { name, link, image, price, description } = wish;

    if (!wish) {
      throw new NotFoundException('Gift not found');
    }

    await this.wishesRepository.increment({ id }, 'copied', 1);

    const newWish = this.wishesRepository.create({
      name,
      link,
      image,
      price,
      description,
      owner: user,
      raised: 0,
      copied: 0,
    });

    return this.wishesRepository.save(newWish);
  }
}
