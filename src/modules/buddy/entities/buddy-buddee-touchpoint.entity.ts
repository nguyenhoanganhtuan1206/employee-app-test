import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { UserEntity } from '../../user/entities/user.entity';
import { BuddyBuddeeTouchpointDto } from '../dtos/buddy-buddee-touchpoint.dto';

@Entity({ name: 'buddy_buddee_touchpoints' })
@UseDto(BuddyBuddeeTouchpointDto)
export class BuddyBuddeeTouchpointEntity extends AbstractEntity<BuddyBuddeeTouchpointDto> {
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'buddy_id' })
  buddy: UserEntity;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'buddee_id' })
  buddee: UserEntity;

  @Column({ nullable: false })
  note: string;

  @Column()
  visible: boolean;

  @Column()
  deleted: boolean;
}
