import * as bcrypt from 'bcrypt';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class HashService {
  private readonly saltRounds = 10;

  async hash(data: string): Promise<string> {
    try {
      return bcrypt.hash(data, this.saltRounds);
    } catch {
      throw new InternalServerErrorException('Hashing password error');
    }
  }

  async compare(data: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(data, hash);
    } catch {
      throw new InternalServerErrorException('Verifying password error');
    }
  }
}
