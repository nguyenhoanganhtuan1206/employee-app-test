import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth, AuthUser } from '../../../decorators';
import { UserEntity } from '../../../modules/user/entities/user.entity';
import type { RepairRequestDto } from '../dtos/repair-request.dto';
import { RepairRequestPageOptionsDto } from '../dtos/repair-request-page-options.dto';
import { RepairRequestService } from '../services/repair-request.service';

@Controller('devices/repair-requests')
@ApiTags('devices/repair-requests')
export class DeviceRepairRequestController {
  constructor(private readonly repairRequestService: RepairRequestService) {}

  @Get('/:deviceId')
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description:
      'Get list repair requests of device is assigned for user login',
    type: PageDto,
  })
  async getRepairRequestsOfDevice(
    @AuthUser() user: UserEntity,
    @Param('deviceId') deviceId: number,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: RepairRequestPageOptionsDto,
  ): Promise<PageDto<RepairRequestDto>> {
    pageOptionsDto.userIds = [user.id];

    return this.repairRequestService.getRepairRequestsOfDevice(
      deviceId,
      pageOptionsDto,
    );
  }
}
