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
import { UserEntity } from '../../modules/user/entities/user.entity';
import { CreateTrainingDto } from './dtos/create-training.dto';
import { TrainingDto } from './dtos/training.dto';
import { TrainingLevelDto } from './dtos/training-level.dto';
import { TrainingTopicDto } from './dtos/training-topic.dto';
import { TrainingsPageOptionsDto } from './dtos/trainings-page-options.dto';
import { UpdateTrainingDto } from './dtos/update-training.dto';
import { TrainingService } from './training.service';

@Controller('trainings')
@ApiTags('trainings')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get()
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get current user login list trainings',
    type: PageDto,
  })
  async getMyTrainings(
    @AuthUser() user: UserEntity,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: TrainingsPageOptionsDto,
  ): Promise<PageDto<TrainingDto>> {
    pageOptionsDto.userIds = [user.id];

    return this.trainingService.getTrainings(pageOptionsDto);
  }

  @Get('levels')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all trainings levels',
    type: TrainingLevelDto,
  })
  async getAllLevels(): Promise<TrainingLevelDto[]> {
    return this.trainingService.findAllLevels();
  }

  @Get('topics')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get all trainings topics',
    type: TrainingTopicDto,
  })
  async getAllTopics(): Promise<TrainingTopicDto[]> {
    return this.trainingService.findAllTopics();
  }

  @Get(':id')
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get training by id',
    type: TrainingDto,
  })
  getMyTraining(
    @AuthUser() user: UserEntity,
    @Param('id') trainingId: number,
  ): Promise<TrainingDto> {
    return this.trainingService.getUserTrainingDetails(user.id, trainingId);
  }

  @Post()
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Create training report',
    type: TrainingDto,
  })
  async createTraining(
    @AuthUser() user: UserEntity,
    @Body() createTrainingDto: CreateTrainingDto,
  ): Promise<TrainingDto> {
    return this.trainingService.createTraining(
      user.id,
      user.id,
      createTrainingDto,
    );
  }

  @Put(':id')
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Update training report',
    type: TrainingDto,
  })
  UpdateTraining(
    @Param('id') id: number,
    @AuthUser() user: UserEntity,
    @Body() updateTrainingDto: UpdateTrainingDto,
  ): Promise<TrainingDto> {
    return this.trainingService.updateTraining(
      id,
      user.id,
      user.id,
      updateTrainingDto,
    );
  }

  @Delete(':id')
  @Auth([RoleType.USER])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    description: 'Delete training report',
  })
  deleteTraining(
    @AuthUser() user: UserEntity,
    @Param('id') trainingId: number,
  ): Promise<void> {
    return this.trainingService.deleteUserTraining(
      user.id,
      user.id,
      trainingId,
    );
  }
}
