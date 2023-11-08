import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../common/dto/page.dto';
import { RoleType } from '../../constants';
import { ApiPageOkResponse, Auth, AuthUser } from '../../decorators';
import { UserEntity } from '../user/entities/user.entity';
import { CreateTrainingDto } from './dtos/create-training.dto';
import { TrainingDto } from './dtos/training.dto';
import { TrainingsPageOptionsDto } from './dtos/trainings-page-options.dto';
import { UpdateTrainingDto } from './dtos/update-training.dto';
import { TrainingService } from './training.service';

@Controller('admin/trainings')
@ApiTags('admin/trainings')
export class AdminTrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all trainings',
    type: PageDto,
  })
  async getTrainings(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: TrainingsPageOptionsDto,
  ): Promise<PageDto<TrainingDto>> {
    return this.trainingService.getTrainings(pageOptionsDto);
  }

  @Get(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all trainings of user',
    type: PageDto,
  })
  async getTrainingsOfUser(
    @Param('id') userId: number,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: TrainingsPageOptionsDto,
  ): Promise<PageDto<TrainingDto>> {
    pageOptionsDto.userIds = [userId];

    return this.trainingService.getTrainings(pageOptionsDto);
  }

  @Get(':userId/:trainingId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all trainings of user',
    type: TrainingDto,
  })
  async getUserTrainingDetails(
    @Param('userId') userId: number,
    @Param('trainingId') trainingId: number,
  ): Promise<TrainingDto> {
    return this.trainingService.getUserTrainingDetails(userId, trainingId);
  }

  @Post(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create user training report',
    type: TrainingDto,
  })
  async createUserTraining(
    @AuthUser() user: UserEntity,
    @Param('id') userId: number,
    @Body() createTrainingDto: CreateTrainingDto,
  ): Promise<TrainingDto> {
    return this.trainingService.createTraining(
      user.id,
      userId,
      createTrainingDto,
    );
  }

  @Put(':userId/:trainingId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update user training report',
    type: TrainingDto,
  })
  async updateUserTraining(
    @AuthUser() user: UserEntity,
    @Param('trainingId') trainingId: number,
    @Param('userId') userId: number,
    @Body() updateTrainingDto: UpdateTrainingDto,
  ): Promise<TrainingDto> {
    return this.trainingService.updateTraining(
      trainingId,
      user.id,
      userId,
      updateTrainingDto,
    );
  }

  @Delete(':userId/:trainingId')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'Delete trainings of user',
  })
  async deleteUserTraining(
    @AuthUser() user: UserEntity,
    @Param('userId') userId: number,
    @Param('trainingId') trainingId: number,
  ): Promise<void> {
    return this.trainingService.deleteUserTraining(user.id, userId, trainingId);
  }
}
