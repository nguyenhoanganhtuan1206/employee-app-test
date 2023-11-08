import { Injectable } from '@nestjs/common';

import UserMapper from '../../user/mappers/user.mapper';
import type { CreateBuddyRequestDto } from '../dtos/create-buddy-request.dto';
import { BuddyEntity } from '../entities/buddy.entity';

@Injectable()
export default class BuddyMapper {
  constructor(private readonly userMapper: UserMapper) {}

  async toBuddyEntity(
    buddyRequestDto: CreateBuddyRequestDto,
  ): Promise<BuddyEntity> {
    const buddyEntity = new BuddyEntity();
    buddyEntity.user = await this.userMapper.toUserEntityFromId(
      buddyRequestDto.userId,
    );

    return buddyEntity;
  }
}
