import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RoleType } from '../../../constants';
import { Auth, AuthUser } from '../../../decorators';
import { UserEntity } from '../../../modules/user/entities/user.entity';
import { TotalRequestDto } from '../dtos/total-request.dto';
import { AttendanceService } from '../services/attendance.service';

@Controller('admin/attendances')
@ApiTags('admin/attendances')
export class AdminAttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('/total-requests')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Get total requests for current admin login',
    type: TotalRequestDto,
  })
  getTotalRequests(@AuthUser() user: UserEntity): Promise<TotalRequestDto> {
    return this.attendanceService.findTotalRequests(user);
  }
}
