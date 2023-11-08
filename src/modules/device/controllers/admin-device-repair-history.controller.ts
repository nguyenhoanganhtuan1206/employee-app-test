import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth } from '../../../decorators';
import { CreateDeviceRepairHistoryDto } from '../dtos/create-device-repair-history.dto';
import { RepairHistoryDto } from '../dtos/repair-history.dto';
import { DeviceManagementService } from '../services/device-management.service';

@Controller('admin/devices')
@ApiTags('admin/devices')
export class AdminDeviceRepairHistoryController {
  constructor(
    private readonly deviceManagementService: DeviceManagementService,
  ) {}

  @Get(':deviceId/repair-histories')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all device repair history by deviceId',
    type: RepairHistoryDto,
  })
  async getAllDeviceRepairHistories(
    @Param('deviceId') deviceId: number,
  ): Promise<RepairHistoryDto[]> {
    return this.deviceManagementService.getAllDeviceRepairHistories(deviceId);
  }

  @Post('repair-histories')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create device repair history',
    type: RepairHistoryDto,
  })
  async createDeviceRepairHistory(
    @Body() createDeviceRepairHistoryDto: CreateDeviceRepairHistoryDto,
  ): Promise<RepairHistoryDto> {
    return this.deviceManagementService.createDeviceRepairHistory(
      createDeviceRepairHistoryDto,
    );
  }

  @Delete('repair-histories/:repairHistoryId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'Delete device repair history',
  })
  async deleteDeviceRepairHistory(
    @Param('repairHistoryId') repairHistoryId: number,
  ): Promise<void> {
    return this.deviceManagementService.deleteDeviceRepairHistory(
      repairHistoryId,
    );
  }
}
