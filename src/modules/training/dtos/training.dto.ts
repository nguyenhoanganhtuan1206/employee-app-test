import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { UserDto } from '../../../modules/user/dtos/user.dto';
import type { TrainingEntity } from '../entities/training.entity';
import { TrainingLevelDto } from './training-level.dto';
import { TrainingTopicDto } from './training-topic.dto';

export class TrainingDto extends AbstractDto {
  @ApiPropertyOptional()
  user: UserDto;

  @ApiProperty()
  trainingDate: Date;

  @ApiProperty()
  duration: number;

  @ApiProperty()
  trainingTitle: string;

  @ApiProperty()
  trainingDescription: string;

  @ApiProperty()
  level: TrainingLevelDto;

  @ApiProperty()
  topic: TrainingTopicDto;

  @ApiPropertyOptional()
  trainingCoaches?: UserDto[];

  @ApiPropertyOptional()
  trainingLink?: string;

  @ApiProperty()
  createdBy: number;

  @ApiProperty()
  updatedBy: number;

  constructor(trainingEntity: TrainingEntity) {
    super(trainingEntity);
    // set user's password = undefined
    trainingEntity.user.password = undefined;
    this.trainingDate = trainingEntity.trainingDate;
    this.duration = trainingEntity.duration;
    this.trainingTitle = trainingEntity.trainingTitle;
    this.trainingDescription = trainingEntity.trainingDescription;
    this.level = trainingEntity.level;
    this.topic = trainingEntity.topic;
    this.user = trainingEntity.user;
    this.trainingCoaches = trainingEntity.trainingCoaches;
    this.trainingLink = trainingEntity.trainingLink;
    this.createdBy = trainingEntity.createdBy;
    this.updatedBy = trainingEntity.updatedBy;
  }
}
