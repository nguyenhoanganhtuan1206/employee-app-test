import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { UserEntity } from '../../user/entities/user.entity';
import { BuddyDto } from '../dtos/buddy.dto';

@Entity({ name: 'buddies' })
@UseDto(BuddyDto)
export class BuddyEntity extends AbstractEntity<BuddyDto> {
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
