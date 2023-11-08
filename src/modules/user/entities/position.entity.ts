import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { UseDto } from '../../../decorators';
import { PositionDto } from '../dtos/position.dto';
import { UserEntity } from './user.entity';

@Entity({ name: 'positions' })
@UseDto(PositionDto)
export class PositionEntity extends AbstractEntity<PositionDto> {
  @Column({ unique: true })
  name?: string;

  @OneToMany(() => UserEntity, (user) => user.position, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  users: UserEntity[];
}
