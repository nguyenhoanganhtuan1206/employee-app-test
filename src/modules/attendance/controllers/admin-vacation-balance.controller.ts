import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth } from '../../../decorators';
import { AllowanceDto } from '../dtos/allowance.dto';
import type { TimeOffRequestDto } from '../dtos/time-off-request.dto';
import { TimeOffRequestsPageOptionsDto } from '../dtos/time-off-requests-page-options.dto';
import { UpdateAllowanceDto } from '../dtos/update-allowance.dto';
import { VacationBalancesPageOptionsDto } from '../dtos/vacation-balances-page-options.dto';
import { AttendanceService } from '../services/attendance.service';
import { TimeOffRequestService } from '../services/time-off-request.service';

@Controller('admin/vacation-balances')
@ApiTags('admin/vacation-balances')
export class AdminVacationBalanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly timeOffRequestService: TimeOffRequestService,
  ) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all vacation balances',
    type: PageDto,
  })
  async getVacationBalances(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: VacationBalancesPageOptionsDto,
  ): Promise<PageDto<AllowanceDto>> {
    return this.attendanceService.getAllVacationBalances(pageOptionsDto);
  }

  @Get(':userId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get list time-off requests by userId',
    type: PageDto,
  })
  getTimeOffRequests(
    @Param('userId') userId: number,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: TimeOffRequestsPageOptionsDto,
  ): Promise<PageDto<TimeOffRequestDto>> {
    pageOptionsDto.userIds = [userId];

    return this.timeOffRequestService.getTimeOffRequests(
      userId,
      pageOptionsDto,
    );
  }

  @Put()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Update total allowance for the user by admin',
    type: AllowanceDto,
  })
  async updateTotalAllowances(
    @Body() updateAllowanceDto: UpdateAllowanceDto,
  ): Promise<AllowanceDto> {
    return this.attendanceService.updateTotalAllowances(updateAllowanceDto);
  }
}
