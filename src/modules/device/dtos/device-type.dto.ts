import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { DeviceTypeEntity } from '../entities/device-type.entity';
import type { DeviceModelDto } from './device-model.dto';

export class DeviceTypeDto extends AbstractDto {
  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  models?: DeviceModelDto[];

  constructor(deviceTypeEntity: DeviceTypeEntity) {
    super(deviceTypeEntity);
    this.name = deviceTypeEntity.name;
    this.models =
      Array.isArray(deviceTypeEntity.models) &&
      deviceTypeEntity.models.length > 0
        ? deviceTypeEntity.models.toDtos()
        : [];
  }
}
