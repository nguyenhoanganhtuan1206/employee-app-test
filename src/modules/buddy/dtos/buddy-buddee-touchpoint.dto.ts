import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { UserDto } from '../../user/dtos/user.dto';
import type { BuddyBuddeeTouchpointEntity } from '../entities/buddy-buddee-touchpoint.entity';

export class BuddyBuddeeTouchpointDto extends AbstractDto {
  @ApiProperty()
  buddy: UserDto;

  @ApiPropertyOptional()
  buddee: UserDto | undefined;

  @ApiPropertyOptional()
  note: string;

  @ApiPropertyOptional()
  visible: boolean;

  constructor(buddyBuddeeTouchpointEntity: BuddyBuddeeTouchpointEntity) {
    super(buddyBuddeeTouchpointEntity);

    this.buddy = buddyBuddeeTouchpointEntity.buddy.toDto();
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    this.buddee = buddyBuddeeTouchpointEntity.buddee
      ? buddyBuddeeTouchpointEntity.buddee.toDto()
      : undefined;
    this.note = buddyBuddeeTouchpointEntity.note;
    this.visible = buddyBuddeeTouchpointEntity.visible;
  }
}
