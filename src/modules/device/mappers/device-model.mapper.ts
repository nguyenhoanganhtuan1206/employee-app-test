import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { ErrorCode, InvalidNotFoundException } from '../../../exceptions';
import type { CreateDeviceModelDto } from '../dtos/create-device-model.dto';
import { DeviceModelEntity } from '../entities/device-model.entity';
import DeviceTypeMapper from './device-type.mapper';

@Injectable()
export default class DeviceModelMapper {
  constructor(
    @InjectRepository(DeviceModelEntity)
    private readonly deviceModelRepository: Repository<DeviceModelEntity>,
    private readonly deviceTypeMapper: DeviceTypeMapper,
  ) {}

  async toDeviceModelEntityFromId(modelId: number): Promise<DeviceModelEntity> {
    const deviceModelEntity = await this.deviceModelRepository.findOneBy({
      id: modelId,
    });

    if (!deviceModelEntity) {
      throw new InvalidNotFoundException(ErrorCode.DEVICE_MODEL_NOT_FOUND);
    }

    return deviceModelEntity;
  }

  async toDeviceModelEntity(
    createDeviceModelDto: CreateDeviceModelDto,
  ): Promise<DeviceModelEntity> {
    const deviceModelEntity = plainToInstance(
      DeviceModelEntity,
      createDeviceModelDto,
    );
    deviceModelEntity.type =
      await this.deviceTypeMapper.toDeviceTypeEntityFromId(
        createDeviceModelDto.typeId,
      );

    return deviceModelEntity;
  }
}
