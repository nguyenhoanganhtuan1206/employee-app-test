import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LevelEntity } from '../../modules/user/entities/level.entity';
import { PositionEntity } from '../../modules/user/entities/position.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import LevelMapper from '../../modules/user/mappers/level.mapper';
import PositionMapper from '../../modules/user/mappers/position.mapper';
import UserMapper from '../../modules/user/mappers/user.mapper';
import { AdminBuddyController } from './controllers/admin-buddy.controller';
import { AdminBuddyBuddeePairController } from './controllers/admin-buddy-buddee-pair.controller';
import { AdminBuddyBuddeeTouchpointController } from './controllers/admin-buddy-buddee-touchpoint.controller';
import { BuddyEntity } from './entities/buddy.entity';
import { BuddyBuddeePairEntity } from './entities/buddy-buddee-pair.entity';
import { BuddyBuddeeTouchpointEntity } from './entities/buddy-buddee-touchpoint.entity';
import BuddyMapper from './mappers/buddy.mapper';
import BuddyBuddeePairMapper from './mappers/buddy-buddee-pair.mapper';
import BuddyBuddeeTouchpointMapper from './mappers/buddy-buddee-touchpoint.mapper';
import { BuddyService } from './services/buddy.service';
import { BuddyBuddeePairService } from './services/buddy-buddee-pair.service';
import { BuddyBuddeeTouchpointService } from './services/buddy-buddee-touchpoint.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BuddyEntity,
      BuddyBuddeePairEntity,
      BuddyBuddeeTouchpointEntity,
      UserEntity,
      PositionEntity,
      LevelEntity,
    ]),
  ],
  controllers: [
    AdminBuddyBuddeeTouchpointController,
    AdminBuddyBuddeePairController,
    AdminBuddyController,
  ],
  exports: [BuddyService, BuddyBuddeePairService, BuddyBuddeeTouchpointService],
  providers: [
    BuddyService,
    BuddyBuddeePairService,
    BuddyMapper,
    BuddyBuddeePairMapper,
    UserMapper,
    PositionMapper,
    LevelMapper,
    BuddyBuddeeTouchpointService,
    BuddyBuddeeTouchpointMapper,
  ],
})
export class BuddyModule {}
