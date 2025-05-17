import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalGuard } from './guards/local-guard';
import { RequestWithUser } from '../shared/types';
import { SensitiveDataInterceptor } from 'src/shared/interceptors/sensitive-data';

@Controller()
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(LocalGuard)
  @Post('signin')
  signin(@Req() { user }: RequestWithUser) {
    return this.authService.auth(user);
  }

  @UseInterceptors(SensitiveDataInterceptor)
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch {
      throw new InternalServerErrorException('Failed to create user');
    }
  }
}
