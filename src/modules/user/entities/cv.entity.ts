import { Column, Entity, ManyToOne } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { CvDto } from '../dtos/cv.dto';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_cvs' })
@UseDto(CvDto)
export class CvEntity extends AbstractEntity<CvDto> {
  @Column()
  cv: string;

  @Column({ nullable: true })
  version?: string;

  @ManyToOne(() => UserEntity, (user) => user.cvs)
  user: UserEntity;

  @Column()
  createdBy: number;

  @Column()
  updatedBy: number;
}
