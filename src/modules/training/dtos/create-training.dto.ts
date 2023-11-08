import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateTrainingDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  trainingDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  duration: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(256, { message: 'Title is too long' })
  trainingTitle: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024, { message: 'Description is too long' })
  trainingDescription: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  levelId: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  topicId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  coachIds?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  trainingLink?: string;
}
