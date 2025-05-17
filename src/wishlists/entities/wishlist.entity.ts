import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { IsUrl } from 'class-validator';
import { Wish } from '../../wishes/entities/wish.entity';

@Entity()
export class Wishlist extends BaseEntity {
  @Column({ length: 250 })
  name: string;

  @Column({ type: 'varchar', length: 1500, nullable: true })
  description?: string;

  @Column()
  @IsUrl()
  image: string;

  @ManyToMany(() => Wish, { eager: true })
  @JoinTable()
  items: Wish[];

  @ManyToOne(() => User, (user) => user.wishlists, { eager: true })
  owner: User;
}
