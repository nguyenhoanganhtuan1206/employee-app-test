import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { UserEntity } from '../../user/entities/user.entity';
import { BuddyBuddeePairDto } from '../dtos/buddy-buddee-pair.dto';

@Entity({ name: 'buddy_buddee_pairs' })
@UseDto(BuddyBuddeePairDto)
export class BuddyBuddeePairEntity extends AbstractEntity<BuddyBuddeePairDto> {
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'buddy_id' })
  buddy: UserEntity;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'buddee_id' })
  buddee: UserEntity;
}
