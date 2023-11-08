import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { DeviceModelEntity } from '../entities/device-model.entity';

export class DeviceModelDto extends AbstractDto {
  @ApiPropertyOptional()
  name: string;

  constructor(deviceModelEntity: DeviceModelEntity) {
    super(deviceModelEntity);
    this.name = deviceModelEntity.name;
  }
}
