import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth } from '../../../decorators';
import { BuddyBuddeeTouchpointDto } from '../dtos/buddy-buddee-touchpoint.dto';
import { BuddyBuddeeTouchpointPageOptionsDto } from '../dtos/buddy-buddee-touchpoint-page-options.dto';
import { CreateBuddyBuddeeTouchpointRequestDto } from '../dtos/create-buddy-buddee-touchpoint-request.dto';
import { BuddyBuddeeTouchpointService } from '../services/buddy-buddee-touchpoint.service';

@Controller('admin/buddies/touchpoints')
@ApiTags('admin/buddies/touchpoints')
export class AdminBuddyBuddeeTouchpointController {
  constructor(
    private readonly buddyTouchpointService: BuddyBuddeeTouchpointService,
  ) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get latest touchpoint of buddy and buddee pair',
    type: PageDto,
  })
  async getBuddyPairTouchpoints(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeeTouchpointDto>> {
    return this.buddyTouchpointService.getBuddyPairTouchpoints(pageOptionsDto);
  }

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Create touchpoint of buddy and buddee',
    type: BuddyBuddeeTouchpointDto,
  })
  async createBuddyBuddeeTouchpoint(
    @Body() createTouchpointRequestDto: CreateBuddyBuddeeTouchpointRequestDto,
  ): Promise<BuddyBuddeeTouchpointDto> {
    return this.buddyTouchpointService.createBuddyBuddeeTouchpoint(
      createTouchpointRequestDto,
    );
  }
}
