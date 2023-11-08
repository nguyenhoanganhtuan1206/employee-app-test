import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { DeviceStatus } from '../../../constants';
import UserMapper from '../../user/mappers/user.mapper';
import type { CreateDeviceDto } from '../dtos/create-device.dto';
import type { CreateDeviceRepairHistoryDto } from '../dtos/create-device-repair-history.dto';
import type { UpdateDeviceDto } from '../dtos/update-device.dto';
import { DeviceEntity } from '../entities/device.entity';
import { RepairHistoryEntity } from '../entities/repair-history.entity';
import DeviceModelMapper from './device-model.mapper';
import DeviceTypeMapper from './device-type.mapper';

@Injectable()
export default class DeviceMapper {
  constructor(
    private readonly deviceModelMapper: DeviceModelMapper,
    private readonly deviceTypeMapper: DeviceTypeMapper,
    private readonly userMapper: UserMapper,
  ) {}

  async toDeviceEntity(
    createDeviceDto: CreateDeviceDto,
  ): Promise<DeviceEntity> {
    const deviceEntity = plainToInstance(DeviceEntity, createDeviceDto);

    deviceEntity.type = await this.deviceTypeMapper.toDeviceTypeEntityFromId(
      createDeviceDto.typeId,
    );
    deviceEntity.model = await this.deviceModelMapper.toDeviceModelEntityFromId(
      createDeviceDto.modelId,
    );

    if (createDeviceDto.assigneeId) {
      deviceEntity.user = await this.userMapper.toUserEntityFromId(
        createDeviceDto.assigneeId,
      );
      deviceEntity.status = DeviceStatus.ASSIGNED;
    } else {
      deviceEntity.status = DeviceStatus.AVAILABLE;
    }

    return deviceEntity;
  }

  async toDeviceEntityToUpdate(
    deviceEntity: DeviceEntity,
    updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceEntity> {
    const editableFields: Array<keyof UpdateDeviceDto> = [
      'serialNumber',
      'detail',
      'note',
    ];

    for (const field of editableFields) {
      deviceEntity[field] = updateDeviceDto[field];
    }

    deviceEntity.type = await this.deviceTypeMapper.toDeviceTypeEntityFromId(
      updateDeviceDto.typeId,
    );
    deviceEntity.model = await this.deviceModelMapper.toDeviceModelEntityFromId(
      updateDeviceDto.modelId,
    );

    return deviceEntity;
  }

  async toRepairHistoryEntity(
    deviceEntity: DeviceEntity,
    createDeviceRepairHistory: CreateDeviceRepairHistoryDto,
  ): Promise<RepairHistoryEntity> {
    const repairHistoryEntity = plainToInstance(
      RepairHistoryEntity,
      createDeviceRepairHistory,
    );

    repairHistoryEntity.requestedBy = await this.userMapper.toUserEntityFromId(
      createDeviceRepairHistory.requestedBy,
    );
    repairHistoryEntity.deviceId = deviceEntity.id;

    return repairHistoryEntity;
  }
}
