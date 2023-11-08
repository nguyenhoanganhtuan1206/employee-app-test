import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../../common/dto/page.dto';
import { DeviceStatus, Order } from '../../../constants';
import UserMapper from '../../../modules/user/mappers/user.mapper';
import { DateProvider } from '../../../providers';
import { CreateDeviceDto } from '../dtos/create-device.dto';
import { CreateDeviceRepairHistoryDto } from '../dtos/create-device-repair-history.dto';
import type { DeviceDto } from '../dtos/device.dto';
import type { DeviceAssigneeHistoryDto } from '../dtos/device-assignee-history.dto';
import type { DevicesPageOptionsDto } from '../dtos/device-page-options.dto';
import type { RepairHistoryDto } from '../dtos/repair-history.dto';
import { UpdateDeviceDto } from '../dtos/update-device.dto';
import { DeviceEntity } from '../entities/device.entity';
import { DeviceAssigneeHistoryEntity } from '../entities/device-assiginee-history.entity';
import { RepairHistoryEntity } from '../entities/repair-history.entity';
import DeviceMapper from '../mappers/device.mapper';
import DeviceModelMapper from '../mappers/device-model.mapper';
import {
  ErrorCode,
  InvalidBadRequestException,
  InvalidNotFoundException,
} from './../../../exceptions';

@Injectable()
export class DeviceManagementService {
  constructor(
    @InjectRepository(DeviceEntity)
    private deviceRepository: Repository<DeviceEntity>,
    @InjectRepository(DeviceAssigneeHistoryEntity)
    private deviceAssigneeHistoryRepository: Repository<DeviceAssigneeHistoryEntity>,
    @InjectRepository(RepairHistoryEntity)
    private deviceRepairHistoryRepository: Repository<RepairHistoryEntity>,
    private readonly deviceMapper: DeviceMapper,
    private readonly deviceModelMapper: DeviceModelMapper,
    private readonly userMapper: UserMapper,
  ) {}

  async getAllDevices(
    pageOptionsDto: DevicesPageOptionsDto,
  ): Promise<PageDto<DeviceDto>> {
    const queryBuilder = this.getDeviceQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  async getAllDeviceRepairHistories(
    deviceId: number,
  ): Promise<RepairHistoryDto[]> {
    const device = await this.findDeviceById(deviceId);

    const deviceRepairHistories = await this.deviceRepairHistoryRepository.find(
      {
        where: {
          deviceId: device.id,
        },
        order: {
          createdAt: Order.DESC,
        },
      },
    );

    return deviceRepairHistories.toDtos();
  }

  @Transactional()
  async createDevice(createDeviceDto: CreateDeviceDto): Promise<DeviceDto> {
    await this.validateDeviceModel(createDeviceDto);

    const deviceEntity =
      await this.deviceMapper.toDeviceEntity(createDeviceDto);

    const newDevice = await this.deviceRepository.save(deviceEntity);

    await this.createNewDeviceAssigneeHistory(newDevice);

    return newDevice.toDto();
  }

  @Transactional()
  async updateDevice(
    deviceId: number,
    updateDeviceDto: UpdateDeviceDto,
  ): Promise<DeviceDto> {
    await this.validateDeviceModel(updateDeviceDto);

    const currentDevice = await this.findDeviceById(deviceId);

    const deviceEntity = await this.deviceMapper.toDeviceEntityToUpdate(
      currentDevice,
      updateDeviceDto,
    );

    await this.validateAndUpdateAssignUserWhenUpdateDevice(
      deviceEntity,
      updateDeviceDto,
    );

    const updatedDevice = await this.deviceRepository.save(deviceEntity);

    await this.createNewDeviceAssigneeHistory(updatedDevice);

    return updatedDevice.toDto();
  }

  @Transactional()
  async deleteDevice(deviceId: number): Promise<void> {
    const currentDevice = await this.findDeviceById(deviceId);

    if (currentDevice.status === DeviceStatus.ASSIGNED) {
      throw new InvalidBadRequestException(
        ErrorCode.CANNOT_DELETE_WHEN_STATUS_ASSIGN,
      );
    }

    await this.validateDeviceAssignmentHistory(currentDevice.id);
    await this.validateDeviceRepairHistory(currentDevice.id);

    await this.deviceRepository.remove(currentDevice);
  }

  private async validateDeviceAssignmentHistory(id: number): Promise<void> {
    const hasDeviceAssignHistory =
      await this.deviceAssigneeHistoryRepository.countBy({ deviceId: id });

    if (hasDeviceAssignHistory !== 0) {
      throw new InvalidBadRequestException(
        ErrorCode.CANNOT_DELETE_WHEN_HAVE_DEVICE_ASSIGN_HISTORY,
      );
    }
  }

  private async validateDeviceRepairHistory(id: number): Promise<void> {
    const hasDeviceRepairHistory =
      await this.deviceRepairHistoryRepository.countBy({
        deviceId: id,
      });

    if (hasDeviceRepairHistory !== 0) {
      throw new InvalidBadRequestException(
        ErrorCode.CANNOT_DELETE_WHEN_HAVE_DEVICE_REPAIR_HISTORY,
      );
    }
  }

  async returnDevice(deviceId: number): Promise<DeviceDto> {
    const currentDevice = await this.findDeviceById(deviceId);

    if (currentDevice.status === DeviceStatus.AVAILABLE) {
      throw new InvalidBadRequestException(
        ErrorCode.CANNOT_RETURN_DEVICE_WHEN_CURRENT_STATUS_AVAILABLE,
      );
    }

    currentDevice.status = DeviceStatus.AVAILABLE;
    currentDevice.user = null;

    const updatedDevice = await this.deviceRepository.save(currentDevice);

    await this.updateDeviceAssigneeHistoryWhenReturn(currentDevice);

    return updatedDevice.toDto();
  }

  async getDeviceDetails(deviceId: number): Promise<DeviceDto> {
    const deviceEntity = await this.findDeviceById(deviceId);

    return deviceEntity.toDto();
  }

  @Transactional()
  async createDeviceRepairHistory(
    createDeviceRepairHistory: CreateDeviceRepairHistoryDto,
  ): Promise<RepairHistoryDto> {
    const deviceEntity = await this.findDeviceById(
      createDeviceRepairHistory.deviceId,
    );
    this.validateRepairDate(createDeviceRepairHistory.repairDate);

    const repairHistoryEntity = await this.deviceMapper.toRepairHistoryEntity(
      deviceEntity,
      createDeviceRepairHistory,
    );

    const newRepairHistoryEntity =
      await this.deviceRepairHistoryRepository.save(repairHistoryEntity);

    return newRepairHistoryEntity.toDto();
  }

  @Transactional()
  async deleteDeviceRepairHistory(repairId: number): Promise<void> {
    const currentRepairHistory =
      await this.deviceRepairHistoryRepository.findOneBy({
        id: repairId,
      });

    if (!currentRepairHistory) {
      throw new InvalidBadRequestException(
        ErrorCode.DEVICE_REPAIR_HISTORY_NOT_FOUND,
      );
    }

    await this.deviceRepairHistoryRepository.remove(currentRepairHistory);
  }

  private validateRepairDate(repairDate: Date): void {
    const currentDate = DateProvider.extractCurrentDate();
    const repairDateExtra = DateProvider.extractDateUTC(repairDate);

    if (repairDateExtra > currentDate) {
      throw new InvalidBadRequestException(
        ErrorCode.CANNOT_SELECT_REPAIR_DATE_IN_FUTURE,
      );
    }
  }

  async getAllDeviceAssignHistoriesById(
    deviceId: number,
  ): Promise<DeviceAssigneeHistoryDto[]> {
    const device = await this.findDeviceById(deviceId);

    const deviceAssigneeHistories =
      await this.deviceAssigneeHistoryRepository.find({
        where: {
          deviceId: device.id,
        },
        order: {
          assignedAt: Order.DESC,
        },
      });

    return deviceAssigneeHistories.toDtos();
  }

  private async validateAndUpdateAssignUserWhenUpdateDevice(
    deviceEntity: DeviceEntity,
    updateDeviceDto: UpdateDeviceDto,
  ): Promise<void> {
    const isUserAssignDifferent = this.isAssignUserWhenUpdateDeviceDifferent(
      deviceEntity,
      updateDeviceDto,
    );

    if (deviceEntity.status === DeviceStatus.AVAILABLE) {
      if (updateDeviceDto.assigneeId) {
        deviceEntity.user = await this.userMapper.toUserEntityFromId(
          updateDeviceDto.assigneeId,
        );
        deviceEntity.status = DeviceStatus.ASSIGNED;
      }
    } else {
      if (updateDeviceDto.assigneeId && isUserAssignDifferent) {
        throw new InvalidBadRequestException(
          ErrorCode.CANNOT_ASSIGN_ANOTHER_USER_TO_AN_ALREADY_ASSIGNED_DEVICE,
        );
      }
    }
  }

  private isAssignUserWhenUpdateDeviceDifferent(
    existingDeviceEntity: DeviceEntity,
    updateDeviceDto: UpdateDeviceDto,
  ): boolean {
    return (
      existingDeviceEntity.status !== DeviceStatus.AVAILABLE &&
      updateDeviceDto.assigneeId !== existingDeviceEntity.user?.id
    );
  }

  private async validateDeviceModel(
    createDeviceDto: CreateDeviceDto,
  ): Promise<void> {
    const deviceModelEntity =
      await this.deviceModelMapper.toDeviceModelEntityFromId(
        createDeviceDto.modelId,
      );

    if (deviceModelEntity.type.id !== createDeviceDto.typeId) {
      throw new InvalidBadRequestException(
        ErrorCode.DEVICE_MODEL_DOES_NOT_BELONG_TO_DEVICE_TYPE,
      );
    }
  }

  private async createNewDeviceAssigneeHistory(
    deviceEntity: DeviceEntity,
  ): Promise<void> {
    const count = await this.deviceAssigneeHistoryRepository.countBy({
      deviceId: deviceEntity.id,
    });
    const deviceAssigneeHistory =
      await this.getDeviceAssigneeHistoryNotReturned(deviceEntity.id);

    if (deviceEntity.user && (count === 0 || !deviceAssigneeHistory)) {
      const deviceAssigneeHistoryEntity = new DeviceAssigneeHistoryEntity();

      deviceAssigneeHistoryEntity.user = deviceEntity.user;
      deviceAssigneeHistoryEntity.deviceId = deviceEntity.id;
      deviceAssigneeHistoryEntity.returnedAt = null;

      await this.deviceAssigneeHistoryRepository.save(
        deviceAssigneeHistoryEntity,
      );
    }
  }

  private async updateDeviceAssigneeHistoryWhenReturn(
    deviceEntity: DeviceEntity,
  ): Promise<void> {
    const deviceAssigneeHistoryEntity =
      await this.getDeviceAssigneeHistoryNotReturned(deviceEntity.id);

    if (deviceAssigneeHistoryEntity) {
      deviceAssigneeHistoryEntity.returnedAt = new Date();

      await this.deviceAssigneeHistoryRepository.save(
        deviceAssigneeHistoryEntity,
      );
    }
  }

  private async getDeviceAssigneeHistoryNotReturned(
    id: number,
  ): Promise<DeviceAssigneeHistoryEntity | null> {
    return this.deviceAssigneeHistoryRepository
      .createQueryBuilder('deviceAssigneeHistory')
      .where('deviceAssigneeHistory.deviceId = :id', { id })
      .andWhere('deviceAssigneeHistory.returnedAt IS NULL')
      .getOne();
  }

  private async findDeviceById(id: number): Promise<DeviceEntity> {
    const device = await this.deviceRepository.findOneBy({ id });

    if (!device) {
      throw new InvalidNotFoundException(ErrorCode.DEVICE_NOT_FOUND);
    }

    return device;
  }

  private getDeviceQueryBuilder(
    pageOptionsDto: DevicesPageOptionsDto,
  ): SelectQueryBuilder<DeviceEntity> {
    const { typeIds, modelIds, detail, serialNumber, statuses, userIds } =
      pageOptionsDto;

    const queryBuilder = this.deviceRepository
      .createQueryBuilder('device')
      .leftJoinAndSelect('device.model', 'model')
      .leftJoinAndSelect('device.type', 'type')
      .leftJoinAndSelect('device.user', 'user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'userLevel');

    queryBuilder.addOrderBy('device.createdAt', Order.DESC);

    if (typeIds?.length) {
      queryBuilder.andWhere('device.type_id IN (:...typeIds)', {
        typeIds,
      });
    }

    if (modelIds?.length) {
      queryBuilder.andWhere('device.model_id IN (:...modelIds)', {
        modelIds,
      });
    }

    if (detail) {
      queryBuilder.andWhere('LOWER(device.detail) LIKE LOWER(:detail)', {
        detail: `%${detail.toLowerCase()}%`,
      });
    }

    if (serialNumber) {
      queryBuilder.andWhere(
        'LOWER(device.serial_number) LIKE LOWER(:serialNumber)',
        {
          serialNumber: `%${serialNumber.toLowerCase()}%`,
        },
      );
    }

    if (statuses?.length) {
      queryBuilder.andWhere('device.status IN (:...statuses)', {
        statuses,
      });
    }

    if (userIds?.length) {
      queryBuilder.andWhere('device.user.id in (:...userIds)', { userIds });
    }

    return queryBuilder;
  }
}
