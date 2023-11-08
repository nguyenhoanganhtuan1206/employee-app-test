import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  RoleType,
  USER_AVATAR_FOLDER,
  USER_CV_FOLDER,
} from '../../../constants';
import { Auth, AuthUser } from '../../../decorators';
import { IFile } from '../../../interfaces';
import { GeneratorProvider } from '../../../providers';
import { AwsS3Service } from '../../../shared/services/aws-s3.service';
import { PasswordDto } from '../dtos/password.dto';
import { UserDto } from '../dtos/user.dto';
import { UserEntity } from '../entities/user.entity';
import { CvService } from '../services/cv.service';
import { UserService } from '../services/user.service';

@Controller('profile')
@ApiTags('profile')
export class ProfileController {
  constructor(
    private readonly userService: UserService,
    private s3Service: AwsS3Service,
    private readonly cvService: CvService,
  ) {}

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get user profile',
    type: UserDto,
  })
  async getUser(@AuthUser() user: UserEntity): Promise<UserDto> {
    const userDto = await this.userService.getUserById(user.id);

    if (userDto.photo) {
      userDto.photo = GeneratorProvider.getS3Url(
        USER_AVATAR_FOLDER,
        user.id,
        userDto.photo,
      );
    }

    if (userDto.cv) {
      userDto.cv.cv = GeneratorProvider.getS3Url(
        USER_CV_FOLDER,
        user.id,
        userDto.cv.cv,
      );
    }

    return userDto;
  }

  @Post('avatar')
  @HttpCode(HttpStatus.CREATED)
  @Auth([RoleType.USER])
  @UseInterceptors(FileInterceptor('file'))
  @ApiOkResponse({
    type: String,
  })
  async updateAvatar(
    @AuthUser() user: UserEntity,
    @UploadedFile() file: IFile,
  ) {
    const s3Path = await this.s3Service.uploadFile(
      file,
      USER_AVATAR_FOLDER,
      user.id,
    );

    await this.userService.updateUserPhoto(user.id, file.originalname);

    return { s3Path };
  }

  @Post('cv')
  @HttpCode(HttpStatus.CREATED)
  @Auth([RoleType.USER])
  @UseInterceptors(FileInterceptor('file'))
  @ApiOkResponse({
    type: String,
  })
  async updateCv(@AuthUser() user: UserEntity, @UploadedFile() file: IFile) {
    const s3Path = await this.s3Service.uploadFile(
      file,
      USER_CV_FOLDER,
      user.id,
    );

    await this.cvService.updateUserCv(user.id, file.originalname);

    return { s3Path };
  }

  @Put('change-password')
  @HttpCode(HttpStatus.OK)
  @Auth([RoleType.USER, RoleType.ADMIN])
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Change password user',
  })
  async changePassword(
    @AuthUser() user: UserEntity,
    @Body() passwordDto: PasswordDto,
  ): Promise<void> {
    return this.userService.changePassword(user.id, passwordDto);
  }
}
