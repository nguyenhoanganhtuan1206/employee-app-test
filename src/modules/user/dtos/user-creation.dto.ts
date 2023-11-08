import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

import { ContractType } from '../../../constants/contract-type';
import { GenderType } from '../../../constants/gender-type';
import { IsAlphabetic } from '../../../decorators';

class UserCreationDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsAlphabetic()
  firstName: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsAlphabetic()
  lastName: string;

  @ApiProperty()
  @IsOptional()
  @IsAlphabetic()
  trigram?: string;

  @ApiProperty()
  @IsNotEmpty()
  positionId: number;

  @ApiProperty()
  @IsNotEmpty()
  levelId: number;

  @ApiPropertyOptional()
  @IsOptional()
  idNo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  phoneNo?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  companyEmail: string;

  @ApiProperty({ enum: GenderType })
  @IsNotEmpty()
  gender: GenderType;

  @ApiProperty({ enum: ContractType })
  @IsNotEmpty()
  contractType: ContractType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  university?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: Date;
}

export default UserCreationDto;
