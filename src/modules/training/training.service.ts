import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import isEqual from 'lodash/isEqual';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../common/dto/page.dto';
import { Order } from '../../constants';
import {
  ErrorCode,
  InvalidBadRequestException,
  InvalidNotFoundException,
} from '../../exceptions';
import type { UserEntity } from '../../modules/user/entities/user.entity';
import UserMapper from '../../modules/user/mappers/user.mapper';
import { ValidatorService } from '../../shared/services/validator.service';
import { CreateTrainingDto } from './dtos/create-training.dto';
import type { TrainingDto } from './dtos/training.dto';
import type { TrainingLevelDto } from './dtos/training-level.dto';
import type { TrainingTopicDto } from './dtos/training-topic.dto';
import type { TrainingsPageOptionsDto } from './dtos/trainings-page-options.dto';
import { UpdateTrainingDto } from './dtos/update-training.dto';
import { TrainingEntity } from './entities/training.entity';
import { TrainingCoachEntity } from './entities/training-coach.entity';
import { TrainingLevelEntity } from './entities/training-level.entity';
import { TrainingTopicEntity } from './entities/training-topic.entity';
import TrainingMapper from './mappers/training.mapper';
import TrainingValidator from './validators/training.validator';

@Injectable()
export class TrainingService {
  private readonly allowedFieldsToSorting: Map<string, string> = new Map([
    ['createdAt', 'training.createdAt'],
  ]);

  constructor(
    @InjectRepository(TrainingEntity)
    private trainingRepository: Repository<TrainingEntity>,
    private validatorService: ValidatorService,
    @InjectRepository(TrainingTopicEntity)
    private trainingTopicRepository: Repository<TrainingTopicEntity>,
    @InjectRepository(TrainingLevelEntity)
    private trainingLevelRepository: Repository<TrainingLevelEntity>,
    @InjectRepository(TrainingCoachEntity)
    private trainingCoachRepository: Repository<TrainingCoachEntity>,
    private readonly userMapper: UserMapper,
    private readonly trainingMapper: TrainingMapper,
    private readonly trainingValidator: TrainingValidator,
  ) {}

  async getTrainings(
    pageOptionsDto: TrainingsPageOptionsDto,
  ): Promise<PageDto<TrainingDto>> {
    const queryBuilder = this.getTrainingQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  async getUserTrainingDetails(
    userId: number,
    trainingId: number,
  ): Promise<TrainingDto> {
    const trainingEntity = await this.findTrainingByIdAndUserId(
      userId,
      trainingId,
    );

    return trainingEntity.toDto();
  }

  @Transactional()
  async createTraining(
    authId: number,
    userId: number,
    createTrainingDto: CreateTrainingDto,
  ): Promise<TrainingDto> {
    this.trainingValidator.validateTrainingDate(createTrainingDto.trainingDate);

    const trainingEntity = await this.trainingMapper.toTrainingEntity(
      authId,
      userId,
      createTrainingDto,
    );

    await this.assignCoachesWhenCreateTraining(
      createTrainingDto,
      trainingEntity,
      userId,
    );

    await this.validateTrainingDuration(null, trainingEntity);
    this.validateTrainingLink(trainingEntity.trainingLink);

    const newTraining = await this.trainingRepository.save(trainingEntity);

    return newTraining.toDto();
  }

  @Transactional()
  async updateTraining(
    id: number,
    authId: number,
    userId: number,
    updateTrainingDto: UpdateTrainingDto,
  ): Promise<TrainingDto> {
    const currentTraining = await this.findTrainingByIdAndUserId(userId, id);
    const trainingEntity = await this.trainingMapper.toTrainingEntityToUpdate(
      authId,
      userId,
      currentTraining,
      updateTrainingDto,
    );

    this.trainingValidator.validateTrainingCreator(
      authId,
      trainingEntity.createdBy,
    );
    this.trainingValidator.validateTrainingCreatedDate(trainingEntity);
    this.trainingValidator.validateTrainingDate(updateTrainingDto.trainingDate);
    await this.validateTrainingDuration(id, trainingEntity);
    this.validateTrainingLink(trainingEntity.trainingLink);

    await this.assignCoachesWhenUpdateTraining(
      updateTrainingDto,
      trainingEntity,
      userId,
    );

    const updatedTraining = await this.trainingRepository.save(trainingEntity);

    return updatedTraining.toDto();
  }

  async deleteUserTraining(
    authId: number,
    userId: number,
    trainingId: number,
  ): Promise<void> {
    const trainingEntity = await this.findTrainingByIdAndUserId(
      userId,
      trainingId,
    );

    this.trainingValidator.validateTrainingCreator(
      authId,
      trainingEntity.createdBy,
    );
    this.trainingValidator.validateTrainingCreatedDate(trainingEntity);

    await this.trainingRepository.remove(trainingEntity);
  }

  private async assignCoachesWhenCreateTraining(
    createTrainingDto: CreateTrainingDto,
    trainingEntity: TrainingEntity,
    userId: number,
  ): Promise<TrainingEntity> {
    const coachIds = createTrainingDto.coachIds ?? [];

    if (coachIds.length > 0) {
      this.validateCoachIds(coachIds, userId);

      trainingEntity.trainingCoaches =
        await this.mapCoachIdsToUserEntities(coachIds);
    }

    return trainingEntity;
  }

  private async assignCoachesWhenUpdateTraining(
    updateTrainingDto: UpdateTrainingDto,
    trainingEntity: TrainingEntity,
    userId: number,
  ): Promise<TrainingEntity> {
    const coachIds = updateTrainingDto.coachIds ?? [];

    if (coachIds.length > 0) {
      this.validateCoachIds(coachIds, userId);

      const currentCoachIds = trainingEntity.trainingCoaches.map(
        (userEntity) => userEntity.id,
      );
      const updateCoachIds: number[] = coachIds;

      const isArraysEqual = this.isArraysEqual(currentCoachIds, updateCoachIds);

      if (!isArraysEqual) {
        await this.deleteTrainingCoachesByTrainingId(trainingEntity.id);

        trainingEntity.trainingCoaches =
          await this.mapCoachIdsToUserEntities(updateCoachIds);
        trainingEntity.updatedAt = new Date();

        return trainingEntity;
      }

      return trainingEntity;
    }

    trainingEntity.trainingCoaches = [];
    trainingEntity.updatedAt = new Date();

    return trainingEntity;
  }

  private validateCoachIds(coachIds: number[], userId: number): void {
    if (coachIds.length > 3) {
      throw new InvalidBadRequestException(
        ErrorCode.COACHES_TRAINING_CANNOT_EXCEED_THREE,
      );
    }

    if (coachIds.includes(userId)) {
      throw new InvalidBadRequestException(
        ErrorCode.CANNOT_COACH_SAME_USER_FROM_TRAINING,
      );
    }

    if (this.hasDuplicateItems(coachIds)) {
      throw new InvalidBadRequestException(
        ErrorCode.COACHES_IN_TRAINING_CANNOT_DUPLICATED,
      );
    }
  }

  private hasDuplicateItems(array: number[]): boolean {
    return new Set(array).size !== array.length;
  }

  private async mapCoachIdsToUserEntities(
    coachIds: number[],
  ): Promise<UserEntity[]> {
    const userPromises: Array<Promise<UserEntity>> = coachIds.map(
      async (coachId) => this.userMapper.toUserEntityFromId(coachId),
    );

    return Promise.all(userPromises);
  }

  private isArraysEqual(
    currentCoachIds: number[],
    updateCoachIds: number[],
  ): boolean {
    return isEqual(updateCoachIds, currentCoachIds);
  }

  private async deleteTrainingCoachesByTrainingId(
    trainingId: number,
  ): Promise<void> {
    const trainingCoachEntities = await this.trainingCoachRepository.find({
      where: {
        trainings: {
          id: trainingId,
        },
      },
    });

    if (trainingCoachEntities.length === 0) {
      return;
    }

    await this.trainingCoachRepository.remove(trainingCoachEntities);
  }

  async findAllLevels(): Promise<TrainingLevelDto[]> {
    const levels = await this.trainingLevelRepository.find();

    return levels.toDtos();
  }

  async findAllTopics(): Promise<TrainingTopicDto[]> {
    const topics = await this.trainingTopicRepository.find();

    return topics.toDtos();
  }

  private validateTrainingLink(trainingLink: string): void {
    if (trainingLink && !this.validatorService.isUrl(trainingLink)) {
      throw new InvalidBadRequestException(
        ErrorCode.STRING_NOT_LINK_BAD_REQUEST,
      );
    }
  }

  private async validateTrainingDuration(
    excludeId: number | null = null,
    training: TrainingEntity,
  ): Promise<void> {
    const maxAllowedHours = 8;
    const total = await this.calculateTotalDuration(training, excludeId);

    if (total + training.duration > maxAllowedHours) {
      throw new InvalidBadRequestException(
        ErrorCode.DURATION_LIMIT_BAD_REQUEST,
      );
    }
  }

  private async calculateTotalDuration(
    training: TrainingEntity,
    excludeId: number | null = null,
  ): Promise<number> {
    const queryBuilder = this.trainingRepository
      .createQueryBuilder('training')
      .select('SUM(training.duration)', 'totalDuration')
      .where('training.user.id = :userId', { userId: training.user.id })
      .andWhere('training.trainingDate = :trainingDate', {
        trainingDate: training.trainingDate,
      })
      .groupBy('training.user.id, training.trainingDate');

    if (excludeId) {
      queryBuilder.andWhere('training.id <> :excludeId', { excludeId });
    }

    const result = await queryBuilder.getRawOne();

    return Number(result?.totalDuration);
  }

  private async findTrainingByIdAndUserId(
    userId: number,
    trainingId: number,
  ): Promise<TrainingEntity> {
    const training = await this.trainingRepository.findOne({
      where: {
        id: trainingId,
        user: { id: userId },
      },
    });

    if (!training) {
      throw new InvalidNotFoundException(ErrorCode.TRAINING_NOT_FOUND);
    }

    return training;
  }

  private getTrainingQueryBuilder(
    pageOptionsDto: TrainingsPageOptionsDto,
  ): SelectQueryBuilder<TrainingEntity> {
    const {
      userIds,
      userName,
      dateFrom,
      dateTo,
      positionIds,
      levelIds,
      topicIds,
      sortColumn,
      orderBy,
      title,
    } = pageOptionsDto;

    const queryBuilder = this.trainingRepository
      .createQueryBuilder('training')
      .leftJoinAndSelect('training.topic', 'topic')
      .leftJoinAndSelect('training.level', 'level')
      .leftJoinAndSelect('training.user', 'user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'userLevel');

    // Sorting
    const sort = this.allowedFieldsToSorting.get(sortColumn);

    if (sort) {
      queryBuilder.orderBy(sort, orderBy);
    }

    queryBuilder.orderBy('training.trainingDate', Order.DESC);
    queryBuilder.addOrderBy('user.firstName', orderBy);
    queryBuilder.addOrderBy('user.lastName', orderBy);
    queryBuilder.addOrderBy('training.createdAt', Order.DESC);

    if (userIds?.length) {
      queryBuilder.andWhere('training.user.id in (:...userIds)', { userIds });
    }

    if (userName) {
      queryBuilder.andWhere(
        [
          `LOWER(CONCAT(user.firstName, ' ', user.lastName)) LIKE LOWER(:userName)`,
        ].join(' OR '),
        { userName: `%${userName}%` },
      );
    }

    if (dateFrom && dateTo) {
      queryBuilder.andWhere(
        'training.trainingDate BETWEEN :dateFrom AND :dateTo',
        {
          dateFrom,
          dateTo,
        },
      );
    }

    if (positionIds?.length) {
      queryBuilder.andWhere('user.position_id IN (:...positionIds)', {
        positionIds,
      });
    }

    if (levelIds?.length) {
      queryBuilder.andWhere('training.level_id IN (:...levelIds)', {
        levelIds,
      });
    }

    if (topicIds?.length) {
      queryBuilder.andWhere('training.topic_id IN (:...topicIds)', {
        topicIds,
      });
    }

    if (title) {
      queryBuilder.andWhere(
        'LOWER(training.training_title) LIKE LOWER(:title)',
        {
          title: `%${title.toLowerCase()}%`,
        },
      );
    }

    return queryBuilder;
  }
}
