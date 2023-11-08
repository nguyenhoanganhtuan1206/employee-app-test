import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { DOT } from '../../../constants';
import { InvalidNotFoundException } from '../../../exceptions';
import { ErrorCode } from '../../../exceptions/error-code';
import { CvEntity } from '../entities/cv.entity';
import { UserEntity } from '../entities/user.entity';
@Injectable()
export class CvService {
  constructor(
    @InjectRepository(CvEntity)
    private cvRepository: Repository<CvEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  @Transactional()
  async updateUserCv(userId: number, url: string) {
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new InvalidNotFoundException(ErrorCode.USER_NOT_FOUND);
    }

    let cv = await this.findByUserId(userId);

    if (cv) {
      const newVersion = this.generateNewVersion(cv);
      cv.cv = url;
      cv.version = newVersion;
    } else {
      cv = new CvEntity();
      cv.cv = url;
      cv.version = this.generateNewVersion(cv);
      cv.user = user;
    }

    cv.createdBy = userId;
    cv.updatedBy = userId;

    await this.cvRepository.save(cv);
  }

  async findByUserId(userId: number): Promise<CvEntity | null> {
    return this.cvRepository
      .createQueryBuilder('cv')
      .where('cv.user_id = :userId', { userId })
      .addOrderBy('cv.created_at', 'DESC')
      .getOne();
  }

  generateNewVersion(cv: CvEntity): string {
    if (!cv.version) {
      return '1.0';
    }

    let [major, minor] = cv.version.split('.').map(Number);

    if (minor === 9) {
      major = major + 1;
    }

    minor = minor + 1;

    return [major, minor].join(DOT);
  }
}
