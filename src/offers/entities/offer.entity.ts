import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { IsPositive } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Wish } from '../../wishes/entities/wish.entity';

@Entity()
export class Offer extends BaseEntity {
  @ManyToOne(() => User, (user) => user.offers, { eager: true })
  user: User;

  @ManyToOne(() => Wish, (wish) => wish.offers, { eager: true })
  item: Wish;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsPositive()
  amount: number;

  @Column({ default: false })
  hidden: boolean;
}
