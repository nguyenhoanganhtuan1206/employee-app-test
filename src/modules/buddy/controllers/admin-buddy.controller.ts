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
import { BuddyPageOptionsDto } from '../dtos/buddy-page-options.dto';
import { CreateBuddyRequestDto } from '../dtos/create-buddy-request.dto';
import { BuddyService } from '../services/buddy.service';

@Controller('admin/buddies')
@ApiTags('admin/buddies')
export class AdminBuddyController {
  constructor(private readonly buddyService: BuddyService) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get buddies',
    type: PageDto,
  })
  async getBuddies(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: BuddyPageOptionsDto,
  ): Promise<PageDto<BuddyDto>> {
    return this.buddyService.getBuddies(pageOptionsDto);
  }

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Create a buddy',
    type: BuddyDto,
  })
  async createBuddy(
    @Body() createBuddyRequestDto: CreateBuddyRequestDto,
  ): Promise<BuddyDto> {
    return this.buddyService.createBuddy(createBuddyRequestDto);
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'Delete buddy by id',
  })
  deleteBuddy(@Param('id') id: number): Promise<void> {
    return this.buddyService.deleteBuddy(id);
  }
}
