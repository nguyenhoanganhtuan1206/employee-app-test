import { BadRequestException, Injectable } from '@nestjs/common';
import type { UserEntity } from 'modules/user/entities/user.entity';

import UserMapper from '../../user/mappers/user.mapper';
import type { CreateBuddyBuddeesPairRequestDto } from '../dtos/create-buddy-buddees-pair-request.dto';
import { BuddyBuddeePairEntity } from '../entities/buddy-buddee-pair.entity';

@Injectable()
export default class BuddyBuddeePairMapper {
  constructor(private readonly userMapper: UserMapper) {}

  async toBuddyBuddeePairEntities(
    buddyBuddeesPairRequestDto: CreateBuddyBuddeesPairRequestDto,
  ): Promise<BuddyBuddeePairEntity[]> {
    const { buddyId, buddeeIds } = buddyBuddeesPairRequestDto;
    const pairEntities: BuddyBuddeePairEntity[] = [];
    const buddy = await this.userMapper.toUserEntityFromId(buddyId);
    const buddees = await this.userMapper.toUserEntities(buddeeIds);

    for (const buddeeId of buddeeIds) {
      const buddee = buddees.find((user: UserEntity) => user.id === buddeeId);

      if (!buddee) {
        throw new BadRequestException(`Buddee with id '${buddeeId}' not found`);
      }

      const buddyPairEntity = new BuddyBuddeePairEntity();
      buddyPairEntity.buddy = buddy;
      buddyPairEntity.buddee = buddee;

      pairEntities.push(buddyPairEntity);
    }

    return pairEntities;
  }
}
