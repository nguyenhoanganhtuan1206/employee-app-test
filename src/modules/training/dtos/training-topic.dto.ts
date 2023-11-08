import { ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { TrainingTopicEntity } from '../entities/training-topic.entity';

export class TrainingTopicDto extends AbstractDto {
  @ApiPropertyOptional()
  label: string;

  constructor(trainingTopicEntity: TrainingTopicEntity) {
    super(trainingTopicEntity);
    this.label = trainingTopicEntity.label;
  }
}
