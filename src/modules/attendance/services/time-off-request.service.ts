import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import type { PageDto } from '../../../common/dto/page.dto';
import { Order, RequestStatusType } from '../../../constants';
import {
  ErrorCode,
  InvalidBadRequestException,
  InvalidNotFoundException,
} from '../../../exceptions';
import { UserEntity } from '../../../modules/user/entities/user.entity';
import { UserService } from '../../../modules/user/services/user.service';
import { AllowanceDto } from '../dtos/allowance.dto';
import { CreateTimeOffRequestDto } from '../dtos/create-time-off-request.dto';
import type { TimeOffRequestDto } from '../dtos/time-off-request.dto';
import { TimeOffRequestPageMeta } from '../dtos/time-off-request-page-meta.dto';
import type { TimeOffRequestsPageOptionsDto } from '../dtos/time-off-requests-page-options.dto';
import { TimeOffRequestEntity } from '../entities/time-off-request.entity';
import TimeOffRequestMapper from '../mapper/time-off-request.mapper';
import AttendanceValidator from '../validators/attendance.validator';

@Injectable()
export class TimeOffRequestService {
  constructor(
    @InjectRepository(TimeOffRequestEntity)
    private timeOffRequestRepository: Repository<TimeOffRequestEntity>,
    private readonly timeOffRequestMapper: TimeOffRequestMapper,
    private readonly attendanceValidator: AttendanceValidator,
    private readonly userService: UserService,
  ) {}

  async getTimeOffRequests(
    userId: number,
    pageOptionsDto: TimeOffRequestsPageOptionsDto,
  ): Promise<PageDto<TimeOffRequestDto>> {
    const user = await this.userService.findUserById(userId);

    const queryBuilder = this.getTimeOffRequestQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    const allowanceDto = await this.findAllowanceAndConvertToDay(user);

    const pageMeta = new TimeOffRequestPageMeta({
      pageOptionsDto,
      itemCount: pageMetaDto.itemCount,
      allowance: allowanceDto,
    });

    return items.toPageDto(pageMeta);
  }

  async getAllTimeOffRequests(
    pageOptionsDto: TimeOffRequestsPageOptionsDto,
  ): Promise<PageDto<TimeOffRequestDto>> {
    const queryBuilder = this.getTimeOffRequestQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  async getTimeOffRequestDetails(
    userId: number,
    timeOffRequestId: number,
  ): Promise<TimeOffRequestDto> {
    const timeOffRequestEntity = await this.findTimeOffRequestByIdAndUserId(
      userId,
      timeOffRequestId,
    );

    return timeOffRequestEntity.toDto();
  }

  @Transactional()
  async createTimeOffRequest(
    user: UserEntity,
    createTimeOffRequestDto: CreateTimeOffRequestDto,
  ): Promise<TimeOffRequestDto> {
    this.attendanceValidator.validateDate(
      createTimeOffRequestDto.dateFrom,
      createTimeOffRequestDto.dateFrom,
      createTimeOffRequestDto.dateType,
    );
    await this.validateCurrentTimeOffBalance(user, createTimeOffRequestDto);

    const timeOffRequestEntity =
      await this.timeOffRequestMapper.toTimeOffRequestEntity(
        user.id,
        createTimeOffRequestDto,
      );

    timeOffRequestEntity.status = RequestStatusType.PENDING;

    const createdTimeOffRequest =
      await this.timeOffRequestRepository.save(timeOffRequestEntity);

    return createdTimeOffRequest.toDto();
  }

  @Transactional()
  async deleteTimeOffRequest(
    userId: number,
    timeOffRequestId: number,
  ): Promise<void> {
    const timeOffRequestEntity = await this.findTimeOffRequestByIdAndUserId(
      userId,
      timeOffRequestId,
    );

    this.attendanceValidator.validateRequestIsPending(
      timeOffRequestEntity.status,
    );

    await this.timeOffRequestRepository.remove(timeOffRequestEntity);
  }

  @Transactional()
  async attachFileRequest(requestId: number, url: string) {
    const timeOffRequest = await this.findTimeOffRequestById(requestId);

    timeOffRequest.attachedFile = url;
    await this.timeOffRequestRepository.save(timeOffRequest);
  }

  private async validateCurrentTimeOffBalance(
    user: UserEntity,
    createTimeOffRequestDto: CreateTimeOffRequestDto,
  ): Promise<void> {
    const allowanceDto = await this.calculateAllowanceUser(user);
    const balance = allowanceDto.balance;

    if (balance === 0) {
      throw new InvalidBadRequestException(
        ErrorCode.CURRENT_TIME_OFF_BALANCE_IS_ZERO,
      );
    }

    if (createTimeOffRequestDto.totalHours > balance) {
      throw new InvalidBadRequestException(
        ErrorCode.REQUESTED_DURATION_GREATER_THAN_CURRENT_TIME_OFF_BALANCE,
      );
    }
  }

  async findAllowanceAndConvertToDay(user: UserEntity): Promise<AllowanceDto> {
    const allowanceDto = await this.calculateAllowanceUser(user);
    const totalDay = allowanceDto.total / 8;

    const newAllowanceDto = new AllowanceDto(totalDay);

    newAllowanceDto.user = user.toDto();
    newAllowanceDto.taken = allowanceDto.taken / 8;
    newAllowanceDto.balance = allowanceDto.balance / 8;

    return newAllowanceDto;
  }

  private async calculateAllowanceUser(
    user: UserEntity,
  ): Promise<AllowanceDto> {
    const currentUser = user;
    const totalAllowance = currentUser.allowance * 8;

    const approvedTimeOffRequests: TimeOffRequestEntity[] =
      await this.timeOffRequestRepository
        .createQueryBuilder('timeOffRequest')
        .where('timeOffRequest.user.id = :id', { id: currentUser.id })
        .andWhere('timeOffRequest.status = :status', {
          status: RequestStatusType.APPROVED,
        })
        .getMany();

    const allowanceDto = new AllowanceDto(totalAllowance);
    const taken: number = approvedTimeOffRequests.reduce(
      (totalHours, request) => totalHours + request.totalHours,
      0,
    );
    const balance: number = totalAllowance - taken;

    allowanceDto.user = user;
    allowanceDto.taken = taken;
    allowanceDto.balance = balance;

    return allowanceDto;
  }

  private async findTimeOffRequestByIdAndUserId(
    userId: number,
    timeOffRequestId: number,
  ): Promise<TimeOffRequestEntity> {
    const timeOffRequest = await this.timeOffRequestRepository.findOne({
      where: {
        id: timeOffRequestId,
        user: { id: userId },
      },
    });

    if (!timeOffRequest) {
      throw new InvalidNotFoundException(ErrorCode.TIME_OFF_REQUEST_NOT_FOUND);
    }

    return timeOffRequest;
  }

  private getTimeOffRequestQueryBuilder(
    pageOptionsDto: TimeOffRequestsPageOptionsDto,
  ): SelectQueryBuilder<TimeOffRequestEntity> {
    const { userIds, dateFrom, dateTo, statuses } = pageOptionsDto;

    const queryBuilder = this.timeOffRequestRepository
      .createQueryBuilder('timeOffRequest')
      .leftJoinAndSelect('timeOffRequest.user', 'user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'userLevel');

    queryBuilder.orderBy('timeOffRequest.dateFrom', Order.DESC);

    queryBuilder.addOrderBy('timeOffRequest.createdAt', Order.DESC);

    if (userIds) {
      queryBuilder.andWhere('timeOffRequest.user.id in (:...userIds)', {
        userIds,
      });
    }

    if (dateFrom && dateTo) {
      queryBuilder.andWhere(
        `
        (timeOffRequest.date_from BETWEEN :dateFrom AND :dateTo) OR
        (timeOffRequest.date_to BETWEEN :dateFrom AND :dateTo) OR
        (:dateFrom > timeOffRequest.date_from AND :dateTo < timeOffRequest.date_to) OR
        (:dateFrom < timeOffRequest.date_from AND :dateTo > timeOffRequest.date_to)`,
        { dateFrom, dateTo },
      );
    }

    if (statuses?.length) {
      queryBuilder.andWhere('timeOffRequest.status IN (:...statuses)', {
        statuses,
      });
    }

    return queryBuilder;
  }

  private async findTimeOffRequestById(
    requestId: number,
  ): Promise<TimeOffRequestEntity> {
    const timeOffRequestEntity = await this.timeOffRequestRepository.findOneBy({
      id: requestId,
    });

    if (!timeOffRequestEntity) {
      throw new InvalidNotFoundException(ErrorCode.TIME_OFF_REQUEST_NOT_FOUND);
    }

    return timeOffRequestEntity;
  }
}
