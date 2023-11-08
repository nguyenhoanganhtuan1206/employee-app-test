import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { PositionEntity } from '../entities/position.entity';

export class PositionDto extends AbstractDto {
  @ApiProperty()
  name?: string;

  constructor(position: PositionEntity) {
    super(position);
    this.name = position.name;
  }
}
