import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import UserMapper from '../../user/mappers/user.mapper';
import type { CreateWfhRequestDto } from '../dtos/create-wfh-request.dto';
import { WfhRequestEntity } from '../entities/wfh-request.entity';

@Injectable()
export default class WfhRequestMapper {
  constructor(private readonly userMapper: UserMapper) {}

  async toWfhRequestEntity(
    userId: number,
    createWfhRequestDto: CreateWfhRequestDto,
  ): Promise<WfhRequestEntity> {
    const wfhRequestEntity = plainToInstance(
      WfhRequestEntity,
      createWfhRequestDto,
    );

    wfhRequestEntity.user = await this.userMapper.toUserEntityFromId(userId);

    wfhRequestEntity.dateFrom = createWfhRequestDto.dateFrom;
    wfhRequestEntity.dateTo = createWfhRequestDto.dateTo;

    return wfhRequestEntity;
  }
}
