import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InvalidNotFoundException } from '../../../exceptions';
import { ErrorCode } from '../../../exceptions/error-code';
import type { TrainingTopicEntity } from '../../training/entities/training-topic.entity';
import { TrainingLevelEntity } from '../entities/training-level.entity';

@Injectable()
export default class TrainingLevelMapper {
  constructor(
    @InjectRepository(TrainingLevelEntity)
    private readonly trainingLevelRepository: Repository<TrainingLevelEntity>,
  ) {}

  async toTrainingLevelEntityFromId(
    levelId: number,
  ): Promise<TrainingTopicEntity> {
    const levelEntity = await this.trainingLevelRepository.findOneBy({
      id: levelId,
    });

    if (!levelEntity) {
      throw new InvalidNotFoundException(ErrorCode.TRAINING_LEVEL_NOT_FOUND);
    }

    return levelEntity;
  }
}
