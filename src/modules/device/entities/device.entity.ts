import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { DeviceStatus } from '../../../constants/device-status';
import { UseDto } from '../../../decorators';
import { UserEntity } from '../../user/entities/user.entity';
import { DeviceDto } from '../dtos/device.dto';
import { DeviceModelEntity } from './device-model.entity';
import { DeviceTypeEntity } from './device-type.entity';

@Entity({ name: 'devices' })
@UseDto(DeviceDto)
export class DeviceEntity extends AbstractEntity<DeviceDto> {
  @ManyToOne(() => DeviceModelEntity, { eager: true })
  @JoinColumn({ name: 'model_id' })
  model: DeviceModelEntity;

  @ManyToOne(() => DeviceTypeEntity, { eager: true })
  @JoinColumn({ name: 'type_id' })
  type: DeviceTypeEntity;

  @Column()
  serialNumber: string;

  @Column({ nullable: false })
  detail: string;

  @Column({ nullable: true })
  note: string;

  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity | null;

  @Column({ type: 'enum', enum: DeviceStatus })
  status: DeviceStatus;
}
