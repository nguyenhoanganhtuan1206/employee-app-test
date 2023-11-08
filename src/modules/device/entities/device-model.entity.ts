import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { DeviceModelDto } from '../dtos/device-model.dto';
import { DeviceTypeEntity } from './device-type.entity';

@Entity({ name: 'device_models' })
@UseDto(DeviceModelDto)
export class DeviceModelEntity extends AbstractEntity<DeviceModelDto> {
  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @ManyToOne(() => DeviceTypeEntity, { eager: true })
  @JoinColumn({ name: 'type_id' })
  type: DeviceTypeEntity;
}
