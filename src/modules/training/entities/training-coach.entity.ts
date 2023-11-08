import { Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UserEntity } from '../../user/entities/user.entity';
import type { TrainingDto } from './../dtos/training.dto';
import { TrainingEntity } from './training.entity';

@Entity('training_coaches')
export class TrainingCoachEntity extends AbstractEntity<TrainingDto> {
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  users: UserEntity[];

  @ManyToOne(() => TrainingEntity, (training) => training.trainingCoaches)
  @JoinColumn({ name: 'training_id' })
  trainings: TrainingEntity[];
}
