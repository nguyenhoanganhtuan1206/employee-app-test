import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { UserEntity } from '../../user/entities/user.entity';
import { TrainingDto } from '../dtos/training.dto';
import { TrainingLevelEntity } from './training-level.entity';
import { TrainingTopicEntity } from './training-topic.entity';

@Entity({ name: 'trainings' })
@UseDto(TrainingDto)
export class TrainingEntity extends AbstractEntity<TrainingDto> {
  @ManyToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'date' })
  trainingDate: Date;

  @Column()
  duration: number;

  @ManyToOne(() => TrainingTopicEntity, { eager: true })
  @JoinColumn({ name: 'topic_id' })
  topic: TrainingTopicEntity;

  @ManyToOne(() => TrainingLevelEntity, { eager: true })
  @JoinColumn({ name: 'level_id' })
  level: TrainingLevelEntity;

  @Column({ length: 256, nullable: true })
  trainingTitle: string;

  @Column({ length: 1024, nullable: true })
  trainingDescription: string;

  @Column({ length: 1024, nullable: true })
  trainingLink: string;

  @ManyToMany(() => UserEntity, {
    eager: true,
    onDelete: 'RESTRICT',
  })
  @JoinTable({
    name: 'training_coaches',
    joinColumn: {
      name: 'training_id',
    },
    inverseJoinColumn: {
      name: 'user_id',
    },
  })
  trainingCoaches: UserEntity[];

  @Column({ nullable: true })
  createdBy: number;

  @Column({ nullable: true })
  updatedBy: number;

  @BeforeInsert()
  setCreatedAt() {
    this.createdAt = new Date();
  }

  @BeforeUpdate()
  setUpdatedAt() {
    this.updatedAt = new Date();
  }
}
