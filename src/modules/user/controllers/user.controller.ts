import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  ValidationPipe,
  Version,
} from '@nestjs/common';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PageDto } from '../../../common/dto/page.dto';
import {
  RoleType,
  USER_AVATAR_FOLDER,
  USER_CV_FOLDER,
} from '../../../constants';
import { ApiPageOkResponse, Auth, AuthUser } from '../../../decorators';
import { UseLanguageInterceptor } from '../../../interceptors/language-interceptor.service';
import { GeneratorProvider } from '../../../providers';
import { TranslationService } from '../../../shared/services/translation.service';
import { UserService } from '../../user/services/user.service';
import { LevelDto } from '../dtos/level.dto';
import { PositionDto } from '../dtos/position.dto';
import UserToUpdateDto from '../dtos/update-user.dto';
import { UserDto } from '../dtos/user.dto';
import UserCreationDto from '../dtos/user-creation.dto';
import { UsersPageOptionsDto } from '../dtos/users-page-options.dto';
import { UserEntity } from '../entities/user.entity';

@Controller('/admin/users')
@ApiTags('/admin/users')
export class UserController {
  constructor(
    private userService: UserService,
    private readonly translationService: TranslationService,
  ) {}

  @Get('admin')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @UseLanguageInterceptor()
  async admin(@AuthUser() user: UserEntity) {
    const translation = await this.translationService.translate(
      'admin.keywords.admin',
    );

    return {
      text: `${translation} ${user.firstName}`,
    };
  }

  @Get('find-coaches')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get users by name(fistName, lastName, companyEmail)',
    type: UserDto,
  })
  findUsers(@Query('keyword') keyword: string): Promise<UserDto[]> {
    return this.userService.findUsersByKeyword(keyword);
  }

  @Get()
  @Version('1/metadata')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get all users without pagination',
    type: PageDto,
  })
  getUsersWithoutPageDto(): Promise<UserDto[]> {
    return this.userService.getUsersWithoutPageDto();
  }

  @Get()
  @Version('1/external')
  @Auth([RoleType.EXTERNAL_USER])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    description: 'Get all users (external usage)',
    type: PageDto,
  })
  getUsersForExternalSystem(): Promise<UserDto[]> {
    Logger.log(`External user is attempting to get list of users`);

    return this.userService.getUsersWithoutPageDto();
  }

  @Get()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get profile list',
    type: PageDto,
  })
  getUsers(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    return this.userService.getUsers(pageOptionsDto);
  }

  @Get('positions')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get positions list',
    type: PositionDto,
  })
  getPositions(): Promise<PositionDto[]> {
    return this.userService.findAllPositions();
  }

  @Get('levels')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get levels list',
    type: LevelDto,
  })
  getLevels(): Promise<LevelDto[]> {
    return this.userService.findAllLevels();
  }

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Create new user profile',
    type: UserDto,
  })
  createUser(@Body() user: UserCreationDto): Promise<UserDto> {
    return this.userService.createUser(user);
  }

  @Put(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Update existing user profile',
    type: UserDto,
  })
  updateUser(
    @Param('id') userId: number,
    @Body() user: UserToUpdateDto,
  ): Promise<UserDto> {
    return this.userService.updateUser(userId, user);
  }

  @Get(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Get profile details',
    type: UserDto,
  })
  async getUserDetails(@Param('id') userId: number): Promise<UserDto> {
    const userDto = await this.userService.getUserById(userId);

    if (userDto.photo) {
      userDto.photo = GeneratorProvider.getS3Url(
        USER_AVATAR_FOLDER,
        userId,
        userDto.photo,
      );
    }

    if (userDto.cv) {
      userDto.cv.cv = GeneratorProvider.getS3Url(
        USER_CV_FOLDER,
        userId,
        userDto.cv.cv,
      );
    }

    return userDto;
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiPageOkResponse({
    description: 'Deactivate user profile',
    type: UserDto,
  })
  deactivateUser(@Param('id') userId: number): Promise<void> {
    return this.userService.deactivatedUser(userId);
  }
}
