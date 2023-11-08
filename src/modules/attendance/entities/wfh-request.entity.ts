import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { DateType, RequestStatusType } from '../../../constants';
import { UseDto } from '../../../decorators';
import { UserEntity } from '../../../modules/user/entities/user.entity';
import { WfhRequestDto } from '../dtos/wfh-request.dto';

@Entity({ name: 'attendance_wfh_requests' })
@UseDto(WfhRequestDto)
export class WfhRequestEntity extends AbstractEntity<WfhRequestDto> {
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'date' })
  dateFrom: Date;

  @Column({ type: 'date' })
  dateTo: Date;

  @Column({ type: 'enum', enum: DateType })
  dateType: string;

  @Column()
  totalHours: number;

  @Column({ length: 1024 })
  details: string;

  @Column({ nullable: true, length: 1024 })
  attachedFile?: string;

  @Column({ type: 'enum', enum: RequestStatusType })
  status: string;
}
