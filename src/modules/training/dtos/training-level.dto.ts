import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { TrainingLevelEntity } from '../entities/training-level.entity';

export class TrainingLevelDto extends AbstractDto {
  @ApiPropertyOptional()
  label: string;

  constructor(trainingLevelEntity: TrainingLevelEntity) {
    super(trainingLevelEntity);
    this.label = trainingLevelEntity.label;
  }
}
