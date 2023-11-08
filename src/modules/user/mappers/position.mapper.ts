import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InvalidBadRequestException } from '../../../exceptions';
import { ErrorCode } from '../../../exceptions/error-code';
import { PositionEntity } from '../entities/position.entity';

@Injectable()
export default class PositionMapper {
  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
  ) {}

  async toPositionEntityFromId(positionId: number): Promise<PositionEntity> {
    const positionEntity = await this.positionRepository.findOneBy({
      id: positionId,
    });

    if (!positionEntity) {
      throw new InvalidBadRequestException(ErrorCode.POSITION_DOES_NOT_EXIST);
    }

    return positionEntity;
  }
}
