import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { TrainingLevelDto } from '../dtos/training-level.dto';

@Entity({ name: 'training_levels' })
@UseDto(TrainingLevelDto)
export class TrainingLevelEntity extends AbstractEntity<TrainingLevelDto> {
  @Column({ type: 'varchar', length: 100, nullable: true })
  label: string;
}
