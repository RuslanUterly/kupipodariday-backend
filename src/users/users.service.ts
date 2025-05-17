import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Wish } from 'src/wishes/entities/wish.entity';
import { HashService } from 'src/hash/hash.service';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, ILike, QueryFailedError, Repository } from 'typeorm';
import { DatabaseError } from 'pg';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password } = createUserDto;

    try {
      const hashedPassword = await this.hashService.hash(password);

      const user = this.usersRepository.create({
        ...createUserDto,
        password: hashedPassword,
      });

      return this.usersRepository.save(user);
    } catch (error: unknown) {
      if (error instanceof QueryFailedError) {
        const errorCode = (error.driverError as DatabaseError).code;

        if (errorCode === '23505') {
          throw new ConflictException('Users already exists');
        }
      }

      throw error;
    }
  }

  findMany(query: string): Promise<User[]> {
    return this.usersRepository.find({
      where: [
        { username: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
    });
  }

  async findOne(options: FindOneOptions<User>): Promise<User> {
    const user = await this.usersRepository.findOne(options);

    if (!user) {
      throw new NotFoundException();
    }

    return user;
  }

  findByUsername(username: string): Promise<User> {
    return this.findOne({
      where: { username: username },
    });
  }

  findById(id: any): Promise<User> {
    return this.findOne({ where: { id } });
  }

  async findWishes(query: { id?: number; username?: string }): Promise<Wish[]> {
    const user = await this.findOne({
      where: query,
      relations: ['wishes', 'wishes.offers', 'wishes.owner'],
    });

    return user.wishes ?? [];
  }

  async updateOne(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findById(id);

    if (updateUserDto.email) {
      const userByEmail = await this.usersRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (userByEmail && userByEmail.id !== id) {
        throw new ConflictException('User already exists');
      }
    }

    if (updateUserDto.username) {
      const userByUsername = await this.usersRepository.findOne({
        where: { username: updateUserDto.username },
      });

      if (userByUsername && userByUsername.id !== id) {
        throw new ConflictException('User already exists');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashService.hash(
        updateUserDto.password,
      );
    }

    await this.usersRepository.update(id, updateUserDto);

    return this.findById(id);
  }
}
