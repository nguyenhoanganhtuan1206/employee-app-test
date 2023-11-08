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
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { RoleType } from '../../../constants';
import { Auth } from '../../../decorators';
import { CreateDeviceTypeDto } from '../dtos/create-device-type.dto';
import { DeviceTypeDto } from '../dtos/device-type.dto';
import { DeviceConfigrationService } from '../services/device-configuration.service';

@Controller('admin/devices/types')
@ApiTags('admin/devices/types')
export class AdminDeviceTypeController {
  constructor(
    private readonly deviceConfigrationService: DeviceConfigrationService,
  ) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get all device types',
    type: [DeviceTypeDto],
  })
  async getAllDeviceTypes(): Promise<DeviceTypeDto[]> {
    return this.deviceConfigrationService.getAllDeviceTypes();
  }

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Create device type',
    type: DeviceTypeDto,
  })
  async createDeviceType(
    @Body() createDeviceTypeDto: CreateDeviceTypeDto,
  ): Promise<DeviceTypeDto> {
    return this.deviceConfigrationService.createDeviceType(createDeviceTypeDto);
  }

  @Put(':typeId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update device type',
    type: DeviceTypeDto,
  })
  async updateDeviceType(
    @Param('typeId') typeId: number,
    @Body() createDeviceTypeDto: CreateDeviceTypeDto,
  ): Promise<DeviceTypeDto> {
    return this.deviceConfigrationService.updateDeviceType(
      typeId,
      createDeviceTypeDto,
    );
  }

  @Delete(':typeId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'Delete device type',
  })
  async deleteDeviceType(@Param('typeId') typeId: number): Promise<void> {
    return this.deviceConfigrationService.deleteDeviceType(typeId);
  }
}
