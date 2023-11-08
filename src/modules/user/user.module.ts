import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import MailService from '../../integrations/mail/mail.service';
import { ProfileController } from './controllers/profile.controller';
import { UserController } from './controllers/user.controller';
import { CvEntity } from './entities/cv.entity';
import { LevelEntity } from './entities/level.entity';
import { PositionEntity } from './entities/position.entity';
import { UserEntity } from './entities/user.entity';
import LevelMapper from './mappers/level.mapper';
import PositionMapper from './mappers/position.mapper';
import UserMapper from './mappers/user.mapper';
import { CvService } from './services/cv.service';
import { UserService } from './services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      PositionEntity,
      LevelEntity,
      CvEntity,
    ]),
  ],
  controllers: [UserController, ProfileController],
  exports: [UserService],
  providers: [
    UserService,
    CvService,
    MailService,
    UserMapper,
    PositionMapper,
    LevelMapper,
  ],
})
export class UserModule {}
