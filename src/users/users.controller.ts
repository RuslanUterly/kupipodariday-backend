import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt-guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { User } from './entities/user.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { UsersService } from './users.service';
import { RequestWithUser } from '../shared/types';
import { SensitiveDataInterceptor } from '../shared/interceptors/sensitive-data';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(SensitiveDataInterceptor)
  @Get('me')
  getCurrentUser(@Req() { user: { id } }: RequestWithUser) {
    return this.usersService.findById(id);
  }

  @UseInterceptors(SensitiveDataInterceptor)
  @Patch('me')
  editCurrentUser(
    @Req() { user: { id } }: RequestWithUser,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateOne(id, dto);
  }

  @UseInterceptors(SensitiveDataInterceptor)
  @Get('me/wishes')
  getProfileWishes(@Req() { user: { id } }: RequestWithUser) {
    return this.usersService.findWishes({ id });
  }

  @UseInterceptors(SensitiveDataInterceptor)
  @Post('find')
  findAll(@Body() { query }: FindUsersDto): Promise<User[]> {
    return this.usersService.findMany(query);
  }

  @UseInterceptors(SensitiveDataInterceptor)
  @Get(':username')
  getByUsername(@Param('username') username: string): Promise<User> {
    return this.usersService.findByUsername(username);
  }

  @UseInterceptors(SensitiveDataInterceptor)
  @Get(':username/wishes')
  getWishesByUsername(@Param('username') username: string): Promise<Wish[]> {
    return this.usersService.findWishes({ username });
  }
}
