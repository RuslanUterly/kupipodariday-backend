import { IsEmail, IsUrl, Length } from 'class-validator';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { defaultUserSettings } from '../constants/user-settings';
import { Wish } from '../../wishes/entities/wish.entity';
import { Offer } from '../../offers/entities/offer.entity';
import { Wishlist } from '../../wishlists/entities/wishlist.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true })
  @Length(2, 30)
  username: string;

  @Column({ default: defaultUserSettings.about })
  @Length(2, 200)
  about: string;

  @Column({ default: defaultUserSettings.avatar })
  @IsUrl()
  avatar: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Wish, (wish) => wish.owner)
  wishes: Wish[];

  @OneToMany(() => Offer, (offer) => offer.user)
  offers: Offer[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.owner)
  wishlists: Wishlist[];
}
