import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { Order } from '../../../constants';
import { ErrorCode, InvalidBadRequestException } from '../../../exceptions';
import { CreateDeviceModelDto } from '../dtos/create-device-model.dto';
import { CreateDeviceTypeDto } from '../dtos/create-device-type.dto';
import type { DeviceModelDto } from '../dtos/device-model.dto';
import type { DeviceTypeDto } from '../dtos/device-type.dto';
import { UpdateDeviceModelDto } from '../dtos/update-device-model.dto';
import { UpdateDeviceTypeDto } from '../dtos/update-device-type.dto';
import { DeviceEntity } from '../entities/device.entity';
import { DeviceModelEntity } from '../entities/device-model.entity';
import { DeviceTypeEntity } from '../entities/device-type.entity';
import DeviceModelMapper from '../mappers/device-model.mapper';
import DeviceTypeMapper from '../mappers/device-type.mapper';

@Injectable()
export class DeviceConfigrationService {
  constructor(
    @InjectRepository(DeviceModelEntity)
    private readonly deviceModelRepository: Repository<DeviceModelEntity>,
    @InjectRepository(DeviceTypeEntity)
    private readonly deviceTypeRepository: Repository<DeviceTypeEntity>,
    @InjectRepository(DeviceEntity)
    private readonly deviceRepository: Repository<DeviceEntity>,
    private readonly deviceModelMapper: DeviceModelMapper,
    private readonly deviceTypeMapper: DeviceTypeMapper,
  ) {}

  async getAllDeviceModels(): Promise<DeviceModelDto[]> {
    const deviceModels = await this.deviceModelRepository.find({
      order: {
        name: Order.ASC,
      },
    });

    return deviceModels.toDtos();
  }

  async getAllDeviceTypes(): Promise<DeviceTypeDto[]> {
    const deviceTypes = await this.deviceTypeRepository.find({
      relations: {
        models: true,
      },
      order: {
        name: Order.ASC,
      },
    });

    return deviceTypes.toDtos();
  }

  @Transactional()
  async createDeviceModel(
    createDeviceModelDto: CreateDeviceModelDto,
  ): Promise<DeviceModelDto> {
    await this.verifyDeviceModelName(createDeviceModelDto.name);

    const deviceModelEntity =
      await this.deviceModelMapper.toDeviceModelEntity(createDeviceModelDto);
    const model = await this.deviceModelRepository.save(deviceModelEntity);

    return model.toDto();
  }

  @Transactional()
  async updateDeviceModel(
    modelId: number,
    updateDeviceModelDto: UpdateDeviceModelDto,
  ): Promise<DeviceModelDto> {
    await this.verifyDeviceModelName(updateDeviceModelDto.name);

    const currentModel =
      await this.deviceModelMapper.toDeviceModelEntityFromId(modelId);

    currentModel.name = updateDeviceModelDto.name;

    const updatedModel = await this.deviceModelRepository.save(currentModel);

    return updatedModel.toDto();
  }

  @Transactional()
  async deleteDeviceModel(modelId: number): Promise<void> {
    await this.hasAssignedDevicesUnderModel(modelId);
    const deviceModelEntity =
      await this.deviceModelMapper.toDeviceModelEntityFromId(modelId);

    await this.deviceModelRepository.remove(deviceModelEntity);
  }

  @Transactional()
  async createDeviceType(
    createDeviceTypeDto: CreateDeviceTypeDto,
  ): Promise<DeviceTypeDto> {
    await this.verifyDeviceTypeName(createDeviceTypeDto.name);

    const deviceTypeEntity = plainToInstance(
      DeviceTypeEntity,
      createDeviceTypeDto,
    );
    const deviceType = await this.deviceTypeRepository.save(deviceTypeEntity);

    return deviceType.toDto();
  }

  @Transactional()
  async updateDeviceType(
    typeId: number,
    updateDeviceTypeDto: UpdateDeviceTypeDto,
  ): Promise<DeviceTypeDto> {
    await this.verifyDeviceTypeName(updateDeviceTypeDto.name);

    const currentType =
      await this.deviceTypeMapper.toDeviceTypeEntityFromId(typeId);

    currentType.name = updateDeviceTypeDto.name;

    const updatedType = await this.deviceTypeRepository.save(currentType);
    const deviceType = await this.deviceTypeRepository.findOneOrFail({
      relations: {
        models: true,
      },
      where: { id: updatedType.id },
    });

    return deviceType.toDto();
  }

  @Transactional()
  async deleteDeviceType(typeId: number): Promise<void> {
    await this.hasAssignedDevicesUnderType(typeId);
    const deviceTypeEntity =
      await this.deviceTypeMapper.toDeviceTypeEntityFromId(typeId);

    await this.deviceTypeRepository.remove(deviceTypeEntity);
  }

  private async hasAssignedDevicesUnderType(typeId: number): Promise<void> {
    const device = await this.deviceRepository.findOne({
      where: {
        type: { id: typeId },
      },
    });

    if (device) {
      throw new InvalidBadRequestException(ErrorCode.TYPE_CAN_NOT_BE_DELETED);
    }
  }

  private async hasAssignedDevicesUnderModel(modelId: number): Promise<void> {
    const device = await this.deviceRepository.findOne({
      where: {
        model: { id: modelId },
      },
    });

    if (device) {
      throw new InvalidBadRequestException(ErrorCode.MODEL_CAN_NOT_BE_DELETED);
    }
  }

  private async verifyDeviceTypeName(typeName: string) {
    const exsitingDeviceTypeWithName = await this.deviceTypeRepository
      .createQueryBuilder('deviceType')
      .where('LOWER(deviceType.name) = LOWER(:typeName)', { typeName })
      .getOne();

    if (exsitingDeviceTypeWithName) {
      throw new InvalidBadRequestException(ErrorCode.TYPE_IS_EXISTED);
    }
  }

  private async verifyDeviceModelName(modelName: string) {
    const exsitingDeviceModelWithName = await this.deviceModelRepository
      .createQueryBuilder('deviceModel')
      .where('LOWER(deviceModel.name) = LOWER(:modelName)', { modelName })
      .getOne();

    if (exsitingDeviceModelWithName) {
      throw new InvalidBadRequestException(ErrorCode.MODEL_IS_EXISTED);
    }
  }
}
