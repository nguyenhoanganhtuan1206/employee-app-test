import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import {
  RoleType,
  TIME_OFF_REQUEST_ATTACH_FILE_FOLDER,
} from '../../../constants';
import { ApiPageOkResponse, Auth, AuthUser } from '../../../decorators';
import { IFile } from '../../../interfaces';
import { UserEntity } from '../../../modules/user/entities/user.entity';
import { GeneratorProvider } from '../../../providers';
import { AwsS3Service } from '../../../shared/services/aws-s3.service';
import { CreateTimeOffRequestDto } from '../dtos/create-time-off-request.dto';
import { TimeOffRequestDto } from '../dtos/time-off-request.dto';
import { TimeOffRequestsPageOptionsDto } from '../dtos/time-off-requests-page-options.dto';
import { TimeOffRequestService } from '../services/time-off-request.service';

@Controller('time-off-requests')
@ApiTags('time-off-requests')
export class TimeOffRequestController {
  constructor(
    private readonly timeOffRequestService: TimeOffRequestService,
    private s3Service: AwsS3Service,
  ) {}

  @Get()
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get current user login list time-off requests',
    type: PageDto,
  })
  getTimeOffRequests(
    @AuthUser() user: UserEntity,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: TimeOffRequestsPageOptionsDto,
  ): Promise<PageDto<TimeOffRequestDto>> {
    pageOptionsDto.userIds = [user.id];

    return this.timeOffRequestService.getTimeOffRequests(
      user.id,
      pageOptionsDto,
    );
  }

  @Post('attach-file/:id')
  @HttpCode(HttpStatus.CREATED)
  @Auth([RoleType.USER])
  @UseInterceptors(FileInterceptor('file'))
  @ApiOkResponse({
    type: String,
  })
  async attachFileRequest(
    @Param('id') requestId: number,
    @UploadedFile() file: IFile,
  ) {
    const s3Path = await this.s3Service.uploadFile(
      file,
      TIME_OFF_REQUEST_ATTACH_FILE_FOLDER,
      requestId,
    );

    await this.timeOffRequestService.attachFileRequest(
      requestId,
      file.originalname,
    );

    return { s3Path };
  }

  @Get(':id')
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get time-off request by id',
    type: TimeOffRequestDto,
  })
  async getTimeOffRequestDetails(
    @AuthUser() user: UserEntity,
    @Param('id') timeOffRequestId: number,
  ): Promise<TimeOffRequestDto> {
    const timeOffRequestDto =
      await this.timeOffRequestService.getTimeOffRequestDetails(
        user.id,
        timeOffRequestId,
      );

    if (timeOffRequestDto.attachedFile) {
      timeOffRequestDto.attachedFile = GeneratorProvider.getS3Url(
        TIME_OFF_REQUEST_ATTACH_FILE_FOLDER,
        user.id,
        timeOffRequestDto.attachedFile,
      );
    }

    return timeOffRequestDto;
  }

  @Post()
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'create time-off request by current user',
    type: TimeOffRequestDto,
  })
  createTimeOffRequest(
    @AuthUser() user: UserEntity,
    @Body() createTimeOffRequestDto: CreateTimeOffRequestDto,
  ): Promise<TimeOffRequestDto> {
    return this.timeOffRequestService.createTimeOffRequest(
      user,
      createTimeOffRequestDto,
    );
  }

  @Delete(':id')
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'Delete time-off request by id',
  })
  deleteTimeOffRequest(
    @AuthUser() user: UserEntity,
    @Param('id') timeOffRequestId: number,
  ): Promise<void> {
    return this.timeOffRequestService.deleteTimeOffRequest(
      user.id,
      timeOffRequestId,
    );
  }
}
