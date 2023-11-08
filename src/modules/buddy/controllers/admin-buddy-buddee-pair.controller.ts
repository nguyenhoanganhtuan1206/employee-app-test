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
  ValidationPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import { RoleType } from '../../../constants';
import { ApiPageOkResponse, Auth } from '../../../decorators';
import { BuddyDto } from '../dtos/buddy.dto';
import type { BuddyBuddeePairDto } from '../dtos/buddy-buddee-pair.dto';
import { BuddyBuddeePairPageOptionsDto } from '../dtos/buddy-buddee-pair-page-options.dto';
import type { BuddyBuddeeTouchpointDto } from '../dtos/buddy-buddee-touchpoint.dto';
import { BuddyBuddeeTouchpointPageOptionsDto } from '../dtos/buddy-buddee-touchpoint-page-options.dto';
import { CreateBuddyBuddeesPairRequestDto } from '../dtos/create-buddy-buddees-pair-request.dto';
import { BuddyBuddeePairService } from '../services/buddy-buddee-pair.service';
import { BuddyBuddeeTouchpointService } from '../services/buddy-buddee-touchpoint.service';

@Controller('admin/buddies/pairs')
@ApiTags('admin/buddies/pairs')
export class AdminBuddyBuddeePairController {
  constructor(
    private readonly buddyPairService: BuddyBuddeePairService,
    private readonly buddyTouchpointService: BuddyBuddeeTouchpointService,
  ) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get pairs of buddy and buddees',
    type: PageDto,
  })
  async getBuddyPairs(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: BuddyBuddeePairPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeePairDto>> {
    return this.buddyPairService.getBuddyPairs(pageOptionsDto);
  }

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Create pairs of buddy and buddees',
    type: BuddyDto,
  })
  async createBuddyPairs(
    @Body() createBuddyBuddeesPairRequestDto: CreateBuddyBuddeesPairRequestDto,
  ): Promise<BuddyBuddeePairDto[]> {
    return this.buddyPairService.createBuddyPairs(
      createBuddyBuddeesPairRequestDto,
    );
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'Delete a pair of buddy and buddee by id',
  })
  deleteBuddyPair(@Param('id') id: number): Promise<void> {
    return this.buddyPairService.deleteBuddyPair(id);
  }

  @Get(':id/touchpoints')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get touchpoints of a pair',
    type: PageDto,
  })
  async getTouchpoints(
    @Param('id') id: number,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: BuddyBuddeeTouchpointPageOptionsDto,
  ): Promise<PageDto<BuddyBuddeeTouchpointDto>> {
    return this.buddyTouchpointService.getTouchpointsByPairId(
      id,
      pageOptionsDto,
    );
  }
}
