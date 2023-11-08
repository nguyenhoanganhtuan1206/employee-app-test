import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth, AuthUser } from '../../../decorators';
import { UserEntity } from '../../../modules/user/entities/user.entity';
import { ExternalAttendanceDto } from '../dtos/external-attendance.dto';
import { TotalRequestDto } from '../dtos/total-request.dto';
import { AttendanceService } from '../services/attendance.service';
import type { AttendanceDto } from './../dtos/attendance.dto';
@Controller('attendances')
@ApiTags('attendances')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get current user login list attendances',
    type: PageDto,
  })
  getAttendanceByUserId(
    @AuthUser() user: UserEntity,
  ): Promise<AttendanceDto[]> {
    return this.attendanceService.getAllAttendanceByUserId(user.id);
  }

  @Get('/total-requests')
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Get total requests for current user login',
    type: TotalRequestDto,
  })
  getTotalRequests(@AuthUser() user: UserEntity): Promise<TotalRequestDto> {
    return this.attendanceService.findTotalRequests(user);
  }

  @Post()
  @Auth([RoleType.EXTERNAL_USER])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description:
      'A webhook endpoint to syncing when an attendance record on external system has changed',
    type: PageDto,
  })
  syncingUserAttendances(
    @Body() externalAttendanceDto: ExternalAttendanceDto,
  ): Promise<void> {
    Logger.log(`An attendance has changed`);

    return this.attendanceService.createOrUpdateUserAttendance(
      externalAttendanceDto,
    );
  }
}
