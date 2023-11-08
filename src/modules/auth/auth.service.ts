import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';

import { validateHash } from '../../common/utils';
import { RoleType, TokenType } from '../../constants';
import { InvalidBadRequestException } from '../../exceptions';
import { ErrorCode } from '../../exceptions/error-code';
import { ApiConfigService } from '../../shared/services/api-config.service';
import type { UserEntity } from '../user/entities/user.entity';
import { UserService } from '../user/services/user.service';
import { TokenPayloadDto } from './dto/TokenPayloadDto';
import type { UserLoginDto } from './dto/UserLoginDto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ApiConfigService,
    private userService: UserService,
  ) {}

  async createAccessToken(data: {
    role: RoleType;
    userId: number;
  }): Promise<TokenPayloadDto> {
    return new TokenPayloadDto({
      expiresIn: this.configService.authConfig.jwtExpirationTime,
      accessToken: await this.jwtService.signAsync({
        userId: data.userId,
        type: TokenType.ACCESS_TOKEN,
        role: data.role,
      }),
    });
  }

  async createExternalUserAccessToken(data: {
    userId: number;
  }): Promise<TokenPayloadDto> {
    const expiresIn = Number.MAX_VALUE;
    const signOptions: SignOptions = {
      expiresIn,
    };

    return new TokenPayloadDto({
      expiresIn,
      accessToken: await this.jwtService.signAsync(
        {
          userId: data.userId,
          type: TokenType.ACCESS_TOKEN,
          role: RoleType.EXTERNAL_USER,
        },
        signOptions,
      ),
    });
  }

  async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
    const user = await this.userService.findOne({
      companyEmail: userLoginDto.email,
    });

    const isPasswordValid = await validateHash(
      userLoginDto.password,
      user?.password,
    );

    if (!user || !isPasswordValid) {
      throw new InvalidBadRequestException(ErrorCode.USERNAME_PASSWORD_INVALID);
    }

    return user;
  }
}
