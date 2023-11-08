import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../../common/dto/page.dto';
import { Order, RequestStatusType } from '../../../constants';
import { ErrorCode, InvalidNotFoundException } from '../../../exceptions';
import { UserService } from '../../../modules/user/services/user.service';
import { CreateWfhRequestDto } from '../dtos/create-wfh-request.dto';
import type { WfhRequestDto } from '../dtos/wfh-request.dto';
import type { WfhRequestsPageOptionsDto } from '../dtos/wfh-requests-page-options.dto';
import { WfhRequestEntity } from '../entities/wfh-request.entity';
import WfhRequestMapper from '../mapper/wfh-request.mapper';
import AttendanceValidator from '../validators/attendance.validator';

@Injectable()
export class WfhRequestService {
  constructor(
    @InjectRepository(WfhRequestEntity)
    private wfhRequestRepository: Repository<WfhRequestEntity>,
    private readonly wfhRequestMapper: WfhRequestMapper,
    private readonly attendanceValidator: AttendanceValidator,
    private readonly userService: UserService,
  ) {}

  async getAllWfhRequests(
    pageOptionsDto: WfhRequestsPageOptionsDto,
  ): Promise<PageDto<WfhRequestDto>> {
    const queryBuilder = this.getWfhRequestQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  @Transactional()
  async createWfhRequest(
    userId: number,
    createWfhRequestDto: CreateWfhRequestDto,
  ): Promise<WfhRequestDto> {
    this.validateRequestDto(createWfhRequestDto);
    const wfhRequestEntity = await this.wfhRequestMapper.toWfhRequestEntity(
      userId,
      createWfhRequestDto,
    );
    wfhRequestEntity.status = RequestStatusType.PENDING;

    const createdWfhEntity =
      await this.wfhRequestRepository.save(wfhRequestEntity);

    return createdWfhEntity.toDto();
  }

  @Transactional()
  async deleteWfhRequest(userId: number, wfhRequestId: number): Promise<void> {
    const wfhRequestEntity = await this.findWfhRequestByIdAndUserId(
      userId,
      wfhRequestId,
    );

    this.attendanceValidator.validateRequestIsPending(wfhRequestEntity.status);

    await this.wfhRequestRepository.remove(wfhRequestEntity);
  }

  async getWfhRequestDetails(
    userId: number,
    wfhRequestId: number,
  ): Promise<WfhRequestDto> {
    const wfhRequestEntity = await this.findWfhRequestByIdAndUserId(
      userId,
      wfhRequestId,
    );

    return wfhRequestEntity.toDto();
  }

  @Transactional()
  async approveWfhRequest(wfhRequestId: number): Promise<WfhRequestDto> {
    const wfhRequestEntity = await this.findWfhRequestById(wfhRequestId);

    wfhRequestEntity.status = RequestStatusType.APPROVED;

    const updateWfhEntity =
      await this.wfhRequestRepository.save(wfhRequestEntity);

    return updateWfhEntity.toDto();
  }

  @Transactional()
  async rejecteWfhRequest(wfhRequestId: number): Promise<WfhRequestDto> {
    const wfhRequestEntity = await this.findWfhRequestById(wfhRequestId);

    wfhRequestEntity.status = RequestStatusType.REJECTED;

    const updateWfhEntity =
      await this.wfhRequestRepository.save(wfhRequestEntity);

    return updateWfhEntity.toDto();
  }

  @Transactional()
  async attachFileRequest(requestId: number, url: string) {
    const wfhRequest = await this.findWfhRequestById(requestId);

    wfhRequest.attachedFile = url;
    await this.wfhRequestRepository.save(wfhRequest);
  }

  private validateRequestDto(createWfhRequestDto: CreateWfhRequestDto) {
    this.attendanceValidator.validateDate(
      createWfhRequestDto.dateFrom,
      createWfhRequestDto.dateTo,
      createWfhRequestDto.dateType,
    );
  }

  private getWfhRequestQueryBuilder(
    pageOptionsDto: WfhRequestsPageOptionsDto,
  ): SelectQueryBuilder<WfhRequestEntity> {
    const { userIds, dateFrom, dateTo, statuses } = pageOptionsDto;

    const queryBuilder = this.wfhRequestRepository
      .createQueryBuilder('wfhRequest')
      .leftJoinAndSelect('wfhRequest.user', 'user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level');

    queryBuilder.orderBy('wfhRequest.dateFrom', Order.DESC);

    queryBuilder.addOrderBy('wfhRequest.createdAt', Order.DESC);

    if (userIds?.length) {
      queryBuilder.andWhere('wfhRequest.user.id in (:...userIds)', { userIds });
    }

    if (dateFrom && dateTo) {
      queryBuilder.andWhere(
        `(wfhRequest.date_from BETWEEN :dateFrom AND :dateTo) OR
         (wfhRequest.date_to BETWEEN :dateFrom AND :dateTo) OR
         (:dateFrom > wfhRequest.date_from AND :dateTo < wfhRequest.date_to) OR
         (:dateFrom < wfhRequest.date_from AND :dateTo > wfhRequest.date_to)`,
        {
          dateFrom,
          dateTo,
        },
      );
    }

    if (statuses?.length) {
      queryBuilder.andWhere('wfhRequest.status IN (:...statuses)', {
        statuses,
      });
    }

    return queryBuilder;
  }

  private async findWfhRequestByIdAndUserId(
    userId: number,
    wfhRequestId: number,
  ): Promise<WfhRequestEntity> {
    const wfhRequest = await this.wfhRequestRepository.findOne({
      where: {
        id: wfhRequestId,
        user: { id: userId },
      },
    });

    if (!wfhRequest) {
      throw new InvalidNotFoundException(ErrorCode.WFH_REQUEST_NOT_FOUND);
    }

    return wfhRequest;
  }

  private async findWfhRequestById(
    requestId: number,
  ): Promise<WfhRequestEntity> {
    const wfhRequestEntity = await this.wfhRequestRepository.findOneBy({
      id: requestId,
    });

    if (!wfhRequestEntity) {
      throw new InvalidNotFoundException(ErrorCode.WFH_REQUEST_NOT_FOUND);
    }

    return wfhRequestEntity;
  }
}
