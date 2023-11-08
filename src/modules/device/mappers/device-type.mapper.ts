import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ErrorCode, InvalidNotFoundException } from '../../../exceptions';
import { DeviceTypeEntity } from '../entities/device-type.entity';

@Injectable()
export default class DeviceTypeMapper {
  constructor(
    @InjectRepository(DeviceTypeEntity)
    private readonly deviceTypeRepository: Repository<DeviceTypeEntity>,
  ) {}

  async toDeviceTypeEntityFromId(typeId: number): Promise<DeviceTypeEntity> {
    const deviceTypeEntity = await this.deviceTypeRepository.findOneBy({
      id: typeId,
    });

    if (!deviceTypeEntity) {
      throw new InvalidNotFoundException(ErrorCode.DEVICE_TYPE_NOT_FOUND);
    }

    return deviceTypeEntity;
  }
}
