import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { UserDto } from '../../user/dtos/user.dto';
import type { BuddyBuddeePairEntity } from '../entities/buddy-buddee-pair.entity';

export class BuddyBuddeePairDto extends AbstractDto {
  @ApiProperty()
  buddy: UserDto;

  @ApiProperty()
  buddee: UserDto;

  constructor(buddyBuddeePairEntity: BuddyBuddeePairEntity) {
    super(buddyBuddeePairEntity);

    this.buddy = buddyBuddeePairEntity.buddy.toDto();
    this.buddee = buddyBuddeePairEntity.buddee.toDto();
  }
}
