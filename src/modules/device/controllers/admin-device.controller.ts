import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth } from '../../../decorators';
import { CreateDeviceDto } from '../dtos/create-device.dto';
import { DeviceDto } from '../dtos/device.dto';
import { DeviceAssigneeHistoryDto } from '../dtos/device-assignee-history.dto';
import { DevicesPageOptionsDto } from '../dtos/device-page-options.dto';
import { UpdateDeviceDto } from '../dtos/update-device.dto';
import { DeviceManagementService } from '../services/device-management.service';

@Controller('admin/devices')
@ApiTags('admin/devices')
export class AdminDeviceController {
  constructor(
    private readonly deviceManagementService: DeviceManagementService,
  ) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all devices',
    type: PageDto,
  })
  async getAllDevices(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: DevicesPageOptionsDto,
  ): Promise<PageDto<DeviceDto>> {
    return this.deviceManagementService.getAllDevices(pageOptionsDto);
  }

  @Get(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get device deatails by id',
    type: DeviceDto,
  })
  getDeviceDetails(@Param('id') deviceId: number): Promise<DeviceDto> {
    return this.deviceManagementService.getDeviceDetails(deviceId);
  }

  @Get(':deviceId/assignee-histories')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get all assignee history of device',
    type: [DeviceAssigneeHistoryDto],
  })
  async getAllDeviceAssignHistoriesById(
    @Param('deviceId') deviceId: number,
  ): Promise<DeviceAssigneeHistoryDto[]> {
    return this.deviceManagementService.getAllDeviceAssignHistoriesById(
      deviceId,
    );
  }

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create device',
    type: DeviceDto,
  })
  async createDevice(
    @Body() createDeviceDto: CreateDeviceDto,
  ): Promise<DeviceDto> {
    return this.deviceManagementService.createDevice(createDeviceDto);
  }

  @Put(':deviceId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update device by id',
    type: DeviceDto,
  })
  async updateDevice(
    @Param('deviceId') deviceId: number,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceDto> {
    return this.deviceManagementService.updateDevice(deviceId, updateDeviceDto);
  }

  @Put(':deviceId/return')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Return device by id',
    type: DeviceDto,
  })
  async returnDevice(@Param('deviceId') deviceId: number): Promise<DeviceDto> {
    return this.deviceManagementService.returnDevice(deviceId);
  }

  @Delete(':deviceId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'Delete device by id',
  })
  async deleteDevice(@Param('deviceId') deviceId: number): Promise<void> {
    return this.deviceManagementService.deleteDevice(deviceId);
  }
}
