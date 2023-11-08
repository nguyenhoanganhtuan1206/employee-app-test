import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { UserEntity } from '../../user/entities/user.entity';
import { RepairHistoryDto } from '../dtos/repair-history.dto';

@Entity({ name: 'repair_histories' })
@UseDto(RepairHistoryDto)
export class RepairHistoryEntity extends AbstractEntity<RepairHistoryDto> {
  @Column()
  deviceId: number;

  @Column({ nullable: false })
  repairDetail: string;

  @Column({ nullable: true })
  supplier: string;

  @Column({ type: 'date' })
  repairDate: Date;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'requested_by' })
  requestedBy: UserEntity;
}
