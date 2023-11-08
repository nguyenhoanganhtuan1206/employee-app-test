import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindManyOptions, SelectQueryBuilder } from 'typeorm';
import { Repository } from 'typeorm';

import { PageDto } from '../../../common/dto/page.dto';
import {
  ContractType,
  DateType,
  GenderType,
  RequestStatusType,
  RoleType,
} from '../../../constants';
import { UserEntity } from '../../../modules/user/entities/user.entity';
import { UserService } from '../../../modules/user/services/user.service';
import { AllowanceDto } from '../dtos/allowance.dto';
import type { AttendanceDto } from '../dtos/attendance.dto';
import type { ExternalAttendanceDto } from '../dtos/external-attendance.dto';
import { TotalRequestDto } from '../dtos/total-request.dto';
import type { UpdateAllowanceDto } from '../dtos/update-allowance.dto';
import type { VacationBalancesPageOptionsDto } from '../dtos/vacation-balances-page-options.dto';
import { TimeOffRequestEntity } from '../entities/time-off-request.entity';
import { WfhRequestEntity } from '../entities/wfh-request.entity';
import { TimeOffRequestService } from './time-off-request.service';

@Injectable()
export class AttendanceService {
  private readonly mockAttendanceDto1: AttendanceDto;

  private readonly mockAttendanceDto2: AttendanceDto;

  private readonly mockAttendanceDto3: AttendanceDto;

  constructor(
    @InjectRepository(TimeOffRequestEntity)
    private timeOffRequestRepository: Repository<TimeOffRequestEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly userService: UserService,
    private readonly timeOffRequestService: TimeOffRequestService,
    @InjectRepository(WfhRequestEntity)
    private wfhRequestRepository: Repository<WfhRequestEntity>,
  ) {
    const currentTime = new Date();
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(currentTime.getDate() - 5);
    const createdAt = currentTime;
    const updatedAt = currentTime;

    this.mockAttendanceDto1 = {
      id: 1,
      date: fiveDaysAgo,
      checkIn: null,
      checkOut: null,
      workingHours: null,
      timeOffRequest: {
        id: 1,
        user: {
          id: 1,
          companyEmail: 'test@gmail.com',
          gender: GenderType.MALE,
          role: RoleType.ADMIN,
          contractType: ContractType.FULLTIME,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        dateFrom: fiveDaysAgo,
        dateTo: fiveDaysAgo,
        dateType: DateType.FULL_DAY,
        totalHours: 8,
        details: 'Deatils mock attendance 01',
        attachedFile: null,
        status: RequestStatusType.APPROVED,
        createdAt,
        updatedAt,
      },
      wfhRequest: null,
      createdAt,
      updatedAt,
    };

    const nextDay = new Date(fiveDaysAgo);
    nextDay.setDate(fiveDaysAgo.getDate() + 1);
    const checkInNextDay = new Date(nextDay.setHours(8, 30, 0, 0));
    const checkOutNextDay = new Date(nextDay.setHours(18, 0, 0, 0));
    const workingHoursNextDay = new Date(nextDay.setHours(8, 0, 0, 0));

    this.mockAttendanceDto2 = {
      id: 2,
      date: nextDay,
      checkIn: checkInNextDay,
      checkOut: checkOutNextDay,
      workingHours: workingHoursNextDay,
      timeOffRequest: null,
      wfhRequest: null,
      createdAt: nextDay,
      updatedAt: nextDay,
    };

    const dayAfterNext = new Date(nextDay);
    dayAfterNext.setDate(nextDay.getDate() + 1);
    const checkInDayAfterNext = new Date(nextDay.setHours(8, 0, 0, 0));
    const checkOutDayAfterNext = new Date(nextDay.setHours(18, 0, 0, 0));
    const workingHoursDayAfterNext = new Date(nextDay.setHours(8, 30, 0, 0));

    this.mockAttendanceDto3 = {
      id: 3,
      date: dayAfterNext,
      checkIn: checkInDayAfterNext,
      checkOut: checkOutDayAfterNext,
      workingHours: workingHoursDayAfterNext,
      timeOffRequest: null,
      wfhRequest: {
        id: 1,
        user: {
          id: 3,
          firstName: 'xx',
          lastName: 'xx',
          position: {
            id: 1,
            createdAt: dayAfterNext,
            updatedAt: dayAfterNext,
            name: 'Manager',
          },
          companyEmail: 'xx',
          gender: GenderType.MALE,
          role: RoleType.USER,
          contractType: ContractType.FULLTIME,
          createdAt: dayAfterNext,
          updatedAt: dayAfterNext,
        },
        dateFrom: dayAfterNext,
        dateTo: dayAfterNext,
        dateType: DateType.FULL_DAY,
        totalHours: 8,
        details: 'Deatils mock attendance 03',
        attachedFile: 'Image01.png',
        status: RequestStatusType.APPROVED,
        createdAt: dayAfterNext,
        updatedAt: dayAfterNext,
      },
      createdAt: dayAfterNext,
      updatedAt: dayAfterNext,
    };
  }

  getAllAttendanceByUserId(_userId: number): Promise<AttendanceDto[]> {
    return Promise.resolve([
      this.mockAttendanceDto1,
      this.mockAttendanceDto2,
      this.mockAttendanceDto3,
    ]);
  }

  async findTotalRequests(user: UserEntity): Promise<TotalRequestDto> {
    const whereClause: FindManyOptions<TimeOffRequestEntity> = {
      where: {
        status: RequestStatusType.PENDING,
        user: user.role === RoleType.USER ? { id: user.id } : undefined,
      },
    };

    const [leaveRequestCount, wfhRequestCount] = await Promise.all([
      this.timeOffRequestRepository.count(whereClause),
      this.wfhRequestRepository.count(whereClause),
    ]);

    const totalRequestDto = new TotalRequestDto();
    totalRequestDto.timeOffRequests = leaveRequestCount;
    totalRequestDto.wfhRequests = wfhRequestCount;

    return totalRequestDto;
  }

  createOrUpdateUserAttendance(
    _externalAttendanceDto: ExternalAttendanceDto,
  ): Promise<void> {
    return Promise.resolve();
  }

  async getAllVacationBalances(
    pageOptionsDto: VacationBalancesPageOptionsDto,
  ): Promise<PageDto<AllowanceDto>> {
    const queryBuilder = this.getVacationBalanceQueryBuilder(pageOptionsDto);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    const allowancePromises = items.map(async (userEntity) => {
      const allowance =
        await this.timeOffRequestService.findAllowanceAndConvertToDay(
          userEntity,
        );

      const allowanceDto = new AllowanceDto(allowance.total);

      allowanceDto.user = userEntity.toDto();
      allowanceDto.taken = allowance.taken;
      allowanceDto.balance = allowance.balance;

      return allowanceDto;
    });

    const allowances = await Promise.all(allowancePromises);

    return new PageDto(allowances, pageMetaDto);
  }

  private getVacationBalanceQueryBuilder(
    pageOptionsDto: VacationBalancesPageOptionsDto,
  ): SelectQueryBuilder<UserEntity> {
    const { userIds } = pageOptionsDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.position', 'position')
      .leftJoinAndSelect('user.level', 'level')
      .leftJoinAndSelect('user.cvs', 'cvs');

    if (userIds?.length) {
      queryBuilder.andWhere('user.id IN (:...userIds)', {
        userIds,
      });
    }

    return queryBuilder;
  }

  async updateTotalAllowances(
    updateAllowanceDto: UpdateAllowanceDto,
  ): Promise<AllowanceDto> {
    const userEntity = await this.userService.findUserById(
      updateAllowanceDto.userId,
    );

    userEntity.allowance = updateAllowanceDto.total;

    const newUserEntity = await this.userRepository.save(userEntity);

    return this.createAllowanceDto(newUserEntity);
  }

  private async createAllowanceDto(
    userEntity: UserEntity,
  ): Promise<AllowanceDto> {
    const allowance =
      await this.timeOffRequestService.findAllowanceAndConvertToDay(userEntity);
    const allowanceDto = new AllowanceDto(allowance.total);

    allowanceDto.user = userEntity.toDto();
    allowanceDto.taken = allowance.taken;
    allowanceDto.balance = allowance.balance;

    return allowanceDto;
  }
}
