import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { LevelEntity } from '../entities/level.entity';

export class LevelDto extends AbstractDto {
  @ApiProperty()
  label?: string;

  constructor(level: LevelEntity) {
    super(level);
    this.label = level.label;
  }
}
