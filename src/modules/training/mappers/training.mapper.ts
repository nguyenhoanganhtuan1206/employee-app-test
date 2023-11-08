import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import UserMapper from '../../user/mappers/user.mapper';
import type { CreateTrainingDto } from '../dtos/create-training.dto';
import type { UpdateTrainingDto } from '../dtos/update-training.dto';
import { TrainingEntity } from '../entities/training.entity';
import TrainingLevelMapper from './training-level.mapper';
import TrainingTopicMapper from './training-topic.mapper';

@Injectable()
export default class TrainingMapper {
  constructor(
    private readonly trainingLevelMapper: TrainingLevelMapper,
    private readonly trainingTopicMapper: TrainingTopicMapper,
    private readonly userMapper: UserMapper,
  ) {}

  async toTrainingEntity(
    authId: number,
    userId: number,
    createTrainingDto: CreateTrainingDto,
  ): Promise<TrainingEntity> {
    const trainingEntity = plainToInstance(TrainingEntity, createTrainingDto);

    trainingEntity.user = await this.userMapper.toUserEntityFromId(userId);
    trainingEntity.level =
      await this.trainingLevelMapper.toTrainingLevelEntityFromId(
        createTrainingDto.levelId,
      );
    trainingEntity.topic =
      await this.trainingTopicMapper.toTrainingTopicEntityFromId(
        createTrainingDto.topicId,
      );
    trainingEntity.createdBy = authId;
    trainingEntity.updatedBy = authId;

    return trainingEntity;
  }

  async toTrainingEntityToUpdate(
    authId: number,
    userId: number,
    exsitingTrainingEntity: TrainingEntity,
    updateTrainingDto: UpdateTrainingDto,
  ): Promise<TrainingEntity> {
    const editableFields: Array<keyof UpdateTrainingDto> = [
      'trainingDate',
      'duration',
      'trainingTitle',
      'trainingDescription',
      'trainingLink',
    ];

    for (const field of editableFields) {
      exsitingTrainingEntity[field] = updateTrainingDto[field];
    }

    exsitingTrainingEntity.user =
      await this.userMapper.toUserEntityFromId(userId);
    exsitingTrainingEntity.level =
      await this.trainingLevelMapper.toTrainingLevelEntityFromId(
        updateTrainingDto.levelId,
      );
    exsitingTrainingEntity.topic =
      await this.trainingTopicMapper.toTrainingTopicEntityFromId(
        updateTrainingDto.topicId,
      );
    exsitingTrainingEntity.updatedBy = authId;

    return exsitingTrainingEntity;
  }
}
