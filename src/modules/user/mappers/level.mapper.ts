import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InvalidBadRequestException } from '../../../exceptions';
import { ErrorCode } from '../../../exceptions/error-code';
import { LevelEntity } from '../entities/level.entity';

@Injectable()
export default class LevelMapper {
  constructor(
    @InjectRepository(LevelEntity)
    private readonly levelRepository: Repository<LevelEntity>,
  ) {}

  async toLevelEntityFromId(levelId: number): Promise<LevelEntity> {
    const levelEntity = await this.levelRepository.findOneBy({
      id: levelId,
    });

    if (!levelEntity) {
      throw new InvalidBadRequestException(ErrorCode.LEVEL_DOES_NOT_EXIST);
    }

    return levelEntity;
  }
}
