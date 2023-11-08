import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import { RoleType } from '../../../constants';
import { ContractType } from '../../../constants/contract-type';
import { GenderType } from '../../../constants/gender-type';
import type { UserEntity } from '../entities/user.entity';
import { CvDto } from './cv.dto';
import { LevelDto } from './level.dto';
import { PositionDto } from './position.dto';

// TODO, remove this class and use constructor's second argument's type
export type UserDtoOptions = Partial<{ isActive: boolean }>;

export class UserDto extends AbstractDto {
  @ApiPropertyOptional()
  firstName?: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiPropertyOptional()
  trigram?: string;

  @ApiProperty()
  position?: PositionDto;

  @ApiProperty()
  level?: LevelDto;

  @ApiPropertyOptional()
  idNo?: number;

  @ApiPropertyOptional()
  phoneNo?: string;

  @ApiPropertyOptional()
  qrCode?: string;

  @ApiPropertyOptional()
  photo?: string;

  @ApiProperty()
  companyEmail: string;

  @ApiPropertyOptional({ enum: GenderType })
  gender: GenderType;

  @ApiPropertyOptional({ enum: RoleType })
  role: RoleType;

  @ApiPropertyOptional({ enum: ContractType })
  contractType: ContractType;

  @ApiPropertyOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  university?: string;

  @ApiPropertyOptional()
  startDate?: Date;

  @ApiPropertyOptional()
  endDate?: Date;

  @ApiPropertyOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  firstLogin?: boolean;

  @ApiProperty()
  cv?: CvDto;

  @ApiPropertyOptional()
  allowance?: number;

  constructor(user: UserEntity, options?: UserDtoOptions) {
    super(user);
    this.id = user.id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.trigram = user.trigram;
    this.level = user.level;
    this.position = user.position;
    this.idNo = user.idNo;
    this.phoneNo = user.phoneNo;
    this.qrCode = user.qrCode;
    this.photo = user.photo;
    this.companyEmail = user.companyEmail;
    this.gender = user.gender;
    this.role = user.role;
    this.contractType = user.contractType;
    this.dateOfBirth = user.dateOfBirth;
    this.address = user.address;
    this.university = user.university;
    this.startDate = user.startDate;
    this.endDate = user.endDate;
    this.isActive = options?.isActive;
    this.firstLogin = user.firstLogin;
    this.allowance = user.allowance;
    this.cv =
      Array.isArray(user.cvs) && user.cvs.length > 0
        ? user.cvs[0].toDto()
        : undefined;
  }
}
