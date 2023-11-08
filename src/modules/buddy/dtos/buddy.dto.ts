import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { UserDto } from '../../user/dtos/user.dto';
import type { BuddyEntity } from '../entities/buddy.entity';

export class BuddyDto extends AbstractDto {
  @ApiProperty()
  buddy: UserDto;

  constructor(buddyEntity: BuddyEntity) {
    super(buddyEntity);

    this.buddy = buddyEntity.user.toDto();
  }
}
