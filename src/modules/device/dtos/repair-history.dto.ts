import { ApiProperty } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { UserDto } from '../../../modules/user/dtos/user.dto';
import { DateProvider } from '../../../providers';
import type { RepairHistoryEntity } from '../entities/repair-history.entity';

export class RepairHistoryDto extends AbstractDto {
  @ApiProperty()
  deviceId: number;

  @ApiProperty()
  requestedBy: UserDto;

  @ApiProperty()
  repairDate: Date;

  @ApiProperty()
  repairDetail: string;

  @ApiProperty()
  supplier: string;

  constructor(repairHistoryEntity: RepairHistoryEntity) {
    super(repairHistoryEntity);
    this.deviceId = repairHistoryEntity.deviceId;
    this.requestedBy = repairHistoryEntity.requestedBy.toDto();
    this.repairDate = DateProvider.formatDate(repairHistoryEntity.repairDate);
    this.repairDetail = repairHistoryEntity.repairDetail;
    this.supplier = repairHistoryEntity.supplier;
  }
}
