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
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth } from '../../../decorators';
import { RepairRequestDto } from '../dtos/repair-request.dto';
import { RepairRequestPageOptionsDto } from '../dtos/repair-request-page-options.dto';
import { UpdateRepairRequestStatusDto } from '../dtos/update-repair-request-status.dto';
import { RepairRequestService } from '../services/repair-request.service';

@Controller('admin/devices/repair-requests')
@ApiTags('admin/devices/repair-requests')
export class AdminDeviceRepairRequestController {
  constructor(private readonly repairRequestService: RepairRequestService) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all repair requests',
    type: PageDto,
  })
  async getAllRepairRequests(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: RepairRequestPageOptionsDto,
  ): Promise<PageDto<RepairRequestDto>> {
    return this.repairRequestService.getAllRepairRequests(pageOptionsDto);
  }

  @Get(':requestId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get repair request detail by id',
    type: RepairRequestDto,
  })
  async getRepairRequestDetails(
    @Param('requestId') requestId: number,
  ): Promise<RepairRequestDto> {
    return this.repairRequestService.getRepairRequestDetails(requestId);
  }

  @Put(':requestId/approve')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update status approve to repair request',
    type: RepairRequestDto,
  })
  async approveRepairRequest(
    @Param('requestId') requestId: number,
    @Body() updateRequest: UpdateRepairRequestStatusDto,
  ): Promise<RepairRequestDto> {
    return this.repairRequestService.approveRepairRequest(
      requestId,
      updateRequest,
    );
  }

  @Put(':requestId/reject')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update status reject to repair request',
    type: RepairRequestDto,
  })
  async rejecteRepairRequest(
    @Param('requestId') requestId: number,
    @Body() updateRequest: UpdateRepairRequestStatusDto,
  ): Promise<RepairRequestDto> {
    return this.repairRequestService.rejectRepairRequest(
      requestId,
      updateRequest,
    );
  }
}
