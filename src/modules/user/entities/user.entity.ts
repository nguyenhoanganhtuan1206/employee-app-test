import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { RoleType } from '../../../constants';
import { ContractType } from '../../../constants/contract-type';
import { GenderType } from '../../../constants/gender-type';
import { IsPassword, UseDto } from '../../../decorators';
import type { UserDtoOptions } from '../dtos/user.dto';
import { UserDto } from '../dtos/user.dto';
import { CvEntity } from './cv.entity';
import { LevelEntity } from './level.entity';
import { PositionEntity } from './position.entity';

@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto, UserDtoOptions> {
  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  trigram?: string;

  @Column({ nullable: true })
  idNo?: number;

  @Column({ nullable: true })
  phoneNo?: string;

  @Column({ unique: true })
  qrCode?: string;

  @Column({ nullable: true })
  photo?: string;

  @Column({ unique: true })
  companyEmail: string;

  @Column()
  @IsPassword()
  password?: string;

  @Column({ type: 'enum', enum: GenderType })
  gender: GenderType;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.USER })
  role: RoleType;

  @Column({ type: 'enum', enum: ContractType })
  contractType: ContractType;

  @Column({ nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  university?: string;

  @Column({ nullable: true, default: 0 })
  allowance: number;

  @Column()
  startDate?: Date;

  @Column({ nullable: true })
  endDate?: Date;

  @Column()
  isActive?: boolean;

  @Column()
  firstLogin?: boolean;

  @ManyToOne(() => PositionEntity, (position) => position.users, {
    eager: true,
  })
  @JoinColumn({ name: 'position_id' })
  position: PositionEntity;

  @ManyToOne(() => LevelEntity, (level) => level.users, {
    eager: true,
  })
  @JoinColumn({ name: 'level_id' })
  level: LevelEntity;

  @OneToMany(() => CvEntity, (cv) => cv.user, {
    onDelete: 'RESTRICT',
    eager: true,
  })
  cvs: CvEntity[];
}
