import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth } from '../../../decorators';
import type { TimeOffRequestDto } from '../dtos/time-off-request.dto';
import { TimeOffRequestsPageOptionsDto } from '../dtos/time-off-requests-page-options.dto';
import { TimeOffRequestService } from '../services/time-off-request.service';

@Controller('admin/time-off-requests')
@ApiTags('admin/time-off-requests')
export class AdminTimeOffRequestController {
  constructor(private readonly timeOffRequestService: TimeOffRequestService) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all time-off requests',
    type: PageDto,
  })
  getTimeOffRequests(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: TimeOffRequestsPageOptionsDto,
  ): Promise<PageDto<TimeOffRequestDto>> {
    return this.timeOffRequestService.getAllTimeOffRequests(pageOptionsDto);
  }
}
