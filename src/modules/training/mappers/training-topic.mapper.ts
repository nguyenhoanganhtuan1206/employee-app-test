import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InvalidNotFoundException } from '../../../exceptions';
import { ErrorCode } from '../../../exceptions/error-code';
import { TrainingTopicEntity } from '../../training/entities/training-topic.entity';

@Injectable()
export default class TrainingTopicMapper {
  constructor(
    @InjectRepository(TrainingTopicEntity)
    private readonly trainingTopicRepository: Repository<TrainingTopicEntity>,
  ) {}

  async toTrainingTopicEntityFromId(
    topicId: number,
  ): Promise<TrainingTopicEntity> {
    const topicEntity = await this.trainingTopicRepository.findOneBy({
      id: topicId,
    });

    if (!topicEntity) {
      throw new InvalidNotFoundException(ErrorCode.TRAINING_TOPIC_NOT_FOUND);
    }

    return topicEntity;
  }
}
