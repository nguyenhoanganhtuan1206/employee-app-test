import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import UserMapper from '../../user/mappers/user.mapper';
import type { CreateTimeOffRequestDto } from '../dtos/create-time-off-request.dto';
import { TimeOffRequestEntity } from '../entities/time-off-request.entity';

@Injectable()
export default class TimeOffRequestMapper {
  constructor(private readonly userMapper: UserMapper) {}

  async toTimeOffRequestEntity(
    userId: number,
    createTimeOffRequestDto: CreateTimeOffRequestDto,
  ): Promise<TimeOffRequestEntity> {
    const timeOffRequestEntity = plainToInstance(
      TimeOffRequestEntity,
      createTimeOffRequestDto,
    );

    timeOffRequestEntity.user =
      await this.userMapper.toUserEntityFromId(userId);

    return timeOffRequestEntity;
  }
}
