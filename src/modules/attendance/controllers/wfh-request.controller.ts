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
import { RoleType, WFH_REQUEST_ATTACH_FILE_FOLDER } from '../../../constants';
import { ApiPageOkResponse, Auth, AuthUser } from '../../../decorators';
import { IFile } from '../../../interfaces';
import { UserEntity } from '../../../modules/user/entities/user.entity';
import { GeneratorProvider } from '../../../providers';
import { AwsS3Service } from '../../../shared/services/aws-s3.service';
import { CreateWfhRequestDto } from '../dtos/create-wfh-request.dto';
import { WfhRequestDto } from '../dtos/wfh-request.dto';
import { WfhRequestsPageOptionsDto } from '../dtos/wfh-requests-page-options.dto';
import { WfhRequestService } from '../services/wfh-request.service';

@Controller('wfh-requests')
@ApiTags('wfh-requests')
export class WfhRequestController {
  constructor(
    private readonly wfhRequestService: WfhRequestService,
    private s3Service: AwsS3Service,
  ) {}

  @Get()
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get current user login list wfh requests',
    type: PageDto,
  })
  getWfhRequestByUserId(
    @AuthUser() user: UserEntity,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: WfhRequestsPageOptionsDto,
  ): Promise<PageDto<WfhRequestDto>> {
    pageOptionsDto.userIds = [user.id];

    return this.wfhRequestService.getAllWfhRequests(pageOptionsDto);
  }

  @Post()
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create wfh request',
    type: WfhRequestDto,
  })
  createWfhRequest(
    @Body() createWfhRequestDto: CreateWfhRequestDto,
    @AuthUser() user: UserEntity,
  ): Promise<WfhRequestDto> {
    return this.wfhRequestService.createWfhRequest(
      user.id,
      createWfhRequestDto,
    );
  }

  @Delete(':id')
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'Delete wfh request by id',
  })
  deleteWfhRequest(
    @AuthUser() user: UserEntity,
    @Param('id') wfhRequestId: number,
  ): Promise<void> {
    return this.wfhRequestService.deleteWfhRequest(user.id, wfhRequestId);
  }

  @Post('attach-file/:id')
  @HttpCode(HttpStatus.CREATED)
  @Auth([RoleType.USER])
  @UseInterceptors(FileInterceptor('file'))
  @ApiOkResponse({
    type: String,
  })
  async attachFile(
    @Param('id') requestId: number,
    @UploadedFile() file: IFile,
  ) {
    const s3Path = await this.s3Service.uploadFile(
      file,
      WFH_REQUEST_ATTACH_FILE_FOLDER,
      requestId,
    );

    await this.wfhRequestService.attachFileRequest(
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
    description: 'Get wfh request by id',
    type: WfhRequestDto,
  })
  async getWfhRequestDetails(
    @AuthUser() user: UserEntity,
    @Param('id') wfhRequestId: number,
  ): Promise<WfhRequestDto> {
    const wfhRequestDto = await this.wfhRequestService.getWfhRequestDetails(
      user.id,
      wfhRequestId,
    );

    if (wfhRequestDto.attachedFile) {
      wfhRequestDto.attachedFile = GeneratorProvider.getS3Url(
        WFH_REQUEST_ATTACH_FILE_FOLDER,
        user.id,
        wfhRequestDto.attachedFile,
      );
    }

    return wfhRequestDto;
  }
}
