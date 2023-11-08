import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { UserEntity } from '../../../modules/user/entities/user.entity';
import { AttendanceDto } from '../dtos/attendance.dto';
import { TimeOffRequestEntity } from './time-off-request.entity';
import { WfhRequestEntity } from './wfh-request.entity';

@Entity({ name: 'attendances' })
@UseDto(AttendanceDto)
export class AttendanceEntity extends AbstractEntity<AttendanceDto> {
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'date' })
  checkIn: Date;

  @Column({ type: 'date' })
  checkOut: Date;

  @ManyToOne(() => TimeOffRequestEntity, { eager: true })
  @JoinColumn({ name: 'time_off_request_id' })
  timeOffRequest: TimeOffRequestEntity;

  @ManyToOne(() => WfhRequestEntity, { eager: true })
  @JoinColumn({ name: 'wfh_request_id' })
  wfhRequest: WfhRequestEntity;
}
