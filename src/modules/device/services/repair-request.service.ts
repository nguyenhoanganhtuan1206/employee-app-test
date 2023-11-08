import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../../common/dto/page.dto';
import { Order, RequestStatusType } from '../../../constants';
import { ErrorCode, InvalidNotFoundException } from '../../../exceptions';
import type { RepairRequestDto } from '../dtos/repair-request.dto';
import type { RepairRequestPageOptionsDto } from '../dtos/repair-request-page-options.dto';
import { UpdateRepairRequestStatusDto } from '../dtos/update-repair-request-status.dto';
import { RepairRequestEntity } from '../entities/repair-request.entity';

@Injectable()
export class RepairRequestService {
  private readonly allowedFieldsToSorting: Map<string, string> = new Map([
    ['createdAt', 'repairRequest.createdAt'],
  ]);

  constructor(
    @InjectRepository(RepairRequestEntity)
    private readonly repairRequestRepository: Repository<RepairRequestEntity>,
  ) {}

  async getAllRepairRequests(
    pageOptionsDto: RepairRequestPageOptionsDto,
  ): Promise<PageDto<RepairRequestDto>> {
    const queryBuilder = this.getRepairRequestQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  async getRepairRequestDetails(requestId: number): Promise<RepairRequestDto> {
    const repairRequest = await this.findRepairRequestById(requestId);

    return repairRequest.toDto();
  }

  async approveRepairRequest(
    requestId: number,
    updateRequest: UpdateRepairRequestStatusDto,
  ): Promise<RepairRequestDto> {
    return this.updateRepairRequestStatus(
      requestId,
      updateRequest,
      RequestStatusType.APPROVED,
    );
  }

  async rejectRepairRequest(
    requestId: number,
    updateRequest: UpdateRepairRequestStatusDto,
  ): Promise<RepairRequestDto> {
    return this.updateRepairRequestStatus(
      requestId,
      updateRequest,
      RequestStatusType.REJECTED,
    );
  }

  async getRepairRequestsOfDevice(
    deviceId: number,
    pageOptionsDto: RepairRequestPageOptionsDto,
  ): Promise<PageDto<RepairRequestDto>> {
    const queryBuilder = this.getRepairRequestOfDeviceQueryBuilder(
      deviceId,
      pageOptionsDto,
    );

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  @Transactional()
  private async updateRepairRequestStatus(
    requestId: number,
    updateRequest: UpdateRepairRequestStatusDto,
    status: RequestStatusType,
  ): Promise<RepairRequestDto> {
    const repairRequestEntity = await this.findRepairRequestById(requestId);

    repairRequestEntity.status = status;
    repairRequestEntity.note = updateRequest.note;

    const updateRepairRequestEntity =
      await this.repairRequestRepository.save(repairRequestEntity);

    return updateRepairRequestEntity.toDto();
  }

  private async findRepairRequestById(
    requestId: number,
  ): Promise<RepairRequestEntity> {
    const repairRequestEntity = await this.repairRequestRepository.findOneBy({
      id: requestId,
    });

    if (!repairRequestEntity) {
      throw new InvalidNotFoundException(ErrorCode.REPAIR_REQUEST_NOT_FOUND);
    }

    return repairRequestEntity;
  }

  private getRepairRequestQueryBuilder(
    pageOptionsDto: RepairRequestPageOptionsDto,
  ): SelectQueryBuilder<RepairRequestEntity> {
    const {
      userIds,
      typeIds,
      modelIds,
      dateFrom,
      dateTo,
      serialNumber,
      statuses,
      sortColumn,
      orderBy,
    } = pageOptionsDto;

    const queryBuilder = this.repairRequestRepository
      .createQueryBuilder('repairRequest')
      .leftJoinAndSelect('repairRequest.device', 'device')
      .leftJoinAndSelect('device.type', 'type')
      .leftJoinAndSelect('device.model', 'model')
      .leftJoinAndSelect('repairRequest.user', 'user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level');

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

    if (dateFrom && dateTo) {
      queryBuilder.andWhere(
        'repairRequest.createdAt BETWEEN :dateFrom AND :dateTo',
        {
          dateFrom,
          dateTo,
        },
      );
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
      queryBuilder.andWhere('repairRequest.status IN (:...statuses)', {
        statuses,
      });
    }

    if (userIds?.length) {
      queryBuilder.andWhere('repairRequest.user.id IN (:...userIds)', {
        userIds,
      });
    }

    const sort = this.allowedFieldsToSorting.get(sortColumn);

    if (sort) {
      queryBuilder.orderBy(sort, orderBy);
    } else {
      queryBuilder.orderBy('repairRequest.createdAt', Order.DESC);
    }

    return queryBuilder;
  }

  private getRepairRequestOfDeviceQueryBuilder(
    deviceId: number,
    pageOptionsDto: RepairRequestPageOptionsDto,
  ): SelectQueryBuilder<RepairRequestEntity> {
    const { userIds } = pageOptionsDto;

    const queryBuilder = this.repairRequestRepository
      .createQueryBuilder('repairRequest')
      .leftJoinAndSelect('repairRequest.device', 'device')
      .leftJoinAndSelect('device.type', 'type')
      .leftJoinAndSelect('device.model', 'model')
      .leftJoinAndSelect('repairRequest.user', 'user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level');

    if (userIds?.length) {
      queryBuilder.andWhere('repairRequest.user.id IN (:...userIds)', {
        userIds,
      });
    }

    queryBuilder.andWhere('device.id = :deviceId', {
      deviceId,
    });
    queryBuilder.orderBy('repairRequest.createdAt', Order.DESC);

    return queryBuilder;
  }
}
