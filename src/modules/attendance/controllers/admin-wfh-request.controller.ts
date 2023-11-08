import {
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
import { RoleType, WFH_REQUEST_ATTACH_FILE_FOLDER } from '../../../constants';
import { ApiPageOkResponse, Auth } from '../../../decorators';
import { GeneratorProvider } from '../../../providers';
import { WfhRequestDto } from '../dtos/wfh-request.dto';
import { WfhRequestsPageOptionsDto } from '../dtos/wfh-requests-page-options.dto';
import { WfhRequestService } from '../services/wfh-request.service';

@Controller('admin/wfh-requests')
@ApiTags('admin/wfh-requests')
export class AdminWfhRequestController {
  constructor(private readonly wfhRequestService: WfhRequestService) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all wfh requests',
    type: PageDto,
  })
  async getWfhRequests(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: WfhRequestsPageOptionsDto,
  ): Promise<PageDto<WfhRequestDto>> {
    return this.wfhRequestService.getAllWfhRequests(pageOptionsDto);
  }

  @Put(':wfhRequestId/approve')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update status approve to wfh request',
    type: WfhRequestDto,
  })
  async approveWfhRequest(
    @Param('wfhRequestId') wfhRequestId: number,
  ): Promise<WfhRequestDto> {
    return this.wfhRequestService.approveWfhRequest(wfhRequestId);
  }

  @Put(':wfhRequestId/reject')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Update status reject to wfh request',
    type: WfhRequestDto,
  })
  async rejecteWfhRequest(
    @Param('wfhRequestId') wfhRequestId: number,
  ): Promise<WfhRequestDto> {
    return this.wfhRequestService.rejecteWfhRequest(wfhRequestId);
  }

  @Get(':userId/:wfhRequestId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get details wfh request of user',
    type: WfhRequestDto,
  })
  async getUserWfhRequestDetails(
    @Param('userId') userId: number,
    @Param('wfhRequestId') wfhRequestId: number,
  ): Promise<WfhRequestDto> {
    const wfhRequestDto = await this.wfhRequestService.getWfhRequestDetails(
      userId,
      wfhRequestId,
    );

    if (wfhRequestDto.attachedFile) {
      wfhRequestDto.attachedFile = GeneratorProvider.getS3Url(
        WFH_REQUEST_ATTACH_FILE_FOLDER,
        userId,
        wfhRequestDto.attachedFile,
      );
    }

    return wfhRequestDto;
  }
}
