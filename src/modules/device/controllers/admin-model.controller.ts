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
import { CreateDeviceModelDto } from '../dtos/create-device-model.dto';
import { DeviceModelDto } from '../dtos/device-model.dto';
import { UpdateDeviceModelDto } from '../dtos/update-device-model.dto';
import { DeviceConfigrationService } from '../services/device-configuration.service';

@Controller('admin/devices/models')
@ApiTags('admin/devices/models')
export class AdminDeviceModelController {
  constructor(
    private readonly deviceConfigrationService: DeviceConfigrationService,
  ) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get all device models',
    type: [DeviceModelDto],
  })
  async getAllDeviceModels(): Promise<DeviceModelDto[]> {
    return this.deviceConfigrationService.getAllDeviceModels();
  }

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Create device model',
    type: DeviceModelDto,
  })
  async createDeviceModel(
    @Body() createDeviceModelDto: CreateDeviceModelDto,
  ): Promise<DeviceModelDto> {
    return this.deviceConfigrationService.createDeviceModel(
      createDeviceModelDto,
    );
  }

  @Put(':modelId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update device model',
    type: DeviceModelDto,
  })
  async updateDeviceModel(
    @Param('modelId') modelId: number,
    @Body() updateDeviceModelDto: UpdateDeviceModelDto,
  ): Promise<DeviceModelDto> {
    return this.deviceConfigrationService.updateDeviceModel(
      modelId,
      updateDeviceModelDto,
    );
  }

  @Delete(':modelId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'Delete device model',
  })
  async deleteDeviceModel(@Param('modelId') modelId: number): Promise<void> {
    return this.deviceConfigrationService.deleteDeviceModel(modelId);
  }
}
