import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { LevelDto } from '../dtos/level.dto';
import { UserEntity } from './user.entity';

@Entity({ name: 'user_levels' })
@UseDto(LevelDto)
export class LevelEntity extends AbstractEntity<LevelDto> {
  @Column({ unique: true })
  label?: string;

  @OneToMany(() => UserEntity, (user) => user.level, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  users: UserEntity[];
}
