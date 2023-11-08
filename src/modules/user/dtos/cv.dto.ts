import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

import { AbstractDto } from '../../../common/dto/abstract.dto';
import type { CvEntity } from '../entities/cv.entity';

export class CvDto extends AbstractDto {
  @ApiProperty()
  cv: string;

  @ApiPropertyOptional()
  version?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  createdBy: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  updatedBy: number;

  constructor(cvEntity: CvEntity) {
    super(cvEntity);
    this.cv = cvEntity.cv;
    this.version = cvEntity.version;
    this.createdBy = cvEntity.createdBy;
    this.updatedBy = cvEntity.updatedBy;
  }
}
