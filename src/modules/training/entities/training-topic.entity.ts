import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { TrainingTopicDto } from '../dtos/training-topic.dto';

@Entity({ name: 'training_topics' })
@UseDto(TrainingTopicDto)
export class TrainingTopicEntity extends AbstractEntity<TrainingTopicDto> {
  @Column({ type: 'varchar', length: 100, nullable: true })
  label: string;
}
