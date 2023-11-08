import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Version,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { RoleType, USER_AVATAR_FOLDER, USER_CV_FOLDER } from '../../constants';
import { Auth, AuthUser } from '../../decorators';
import { GeneratorProvider } from '../../providers';
import { UserDto } from '../user/dtos/user.dto';
import { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/services/user.service';
import { AuthService } from './auth.service';
import { ForgotPassswordDto } from './dto/ForgotPasswordDto';
import { LoginPayloadDto } from './dto/LoginPayloadDto';
import { TokenPayloadDto } from './dto/TokenPayloadDto';
import { UserLoginDto } from './dto/UserLoginDto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LoginPayloadDto,
    description: 'User info with access token',
  })
  async userLogin(
    @Body() userLoginDto: UserLoginDto,
  ): Promise<LoginPayloadDto> {
    const userEntity = await this.authService.validateUser(userLoginDto);

    const token = await this.authService.createAccessToken({
      userId: userEntity.id,
      role: userEntity.role,
    });

    const userDto = userEntity.toDto();

    if (userDto.photo) {
      userDto.photo = GeneratorProvider.getS3Url(
        USER_AVATAR_FOLDER,
        userEntity.id,
        userDto.photo,
      );
    }

    if (userDto.cv) {
      userDto.cv.cv = GeneratorProvider.getS3Url(
        USER_CV_FOLDER,
        userEntity.id,
        userDto.cv.cv,
      );
    }

    return new LoginPayloadDto(userDto, token);
  }

  @Post('generate-access-token')
  @Version('1/external')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Generate access token for external user',
    type: TokenPayloadDto,
  })
  generateAccessTokenForExternalUser(): Promise<TokenPayloadDto> {
    return this.authService.createExternalUserAccessToken({
      userId: 0,
    });
  }

  @Version('1')
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @Auth([RoleType.USER, RoleType.ADMIN])
  @ApiOkResponse({ type: UserDto, description: 'current user info' })
  getCurrentUser(@AuthUser() user: UserEntity): UserDto {
    return user.toDto();
  }

  @Put('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Request forgot password',
  })
  forgotPassword(@Body() forgotPassword: ForgotPassswordDto): Promise<void> {
    return this.userService.forgotPassword(forgotPassword.email);
  }
}
