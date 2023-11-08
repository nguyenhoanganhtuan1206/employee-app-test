import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import UserMapper from '../../user/mappers/user.mapper';
import type { CreateBuddyBuddeeTouchpointRequestDto } from '../dtos/create-buddy-buddee-touchpoint-request.dto';
import { BuddyBuddeeTouchpointEntity } from '../entities/buddy-buddee-touchpoint.entity';

@Injectable()
export default class BuddyBuddeeTouchpointMapper {
  constructor(private readonly userMapper: UserMapper) {}

  async toBuddyBuddeeTouchpointEntity(
    buddyBuddeeTouchpointRequestDto: CreateBuddyBuddeeTouchpointRequestDto,
  ): Promise<BuddyBuddeeTouchpointEntity> {
    const { buddyId, buddeeId } = buddyBuddeeTouchpointRequestDto;
    const buddyTouchpointEntity = plainToInstance(
      BuddyBuddeeTouchpointEntity,
      buddyBuddeeTouchpointRequestDto,
    );

    buddyTouchpointEntity.buddy =
      await this.userMapper.toUserEntityFromId(buddyId);
    buddyTouchpointEntity.buddee =
      await this.userMapper.toUserEntityFromId(buddeeId);

    return buddyTouchpointEntity;
  }
}
