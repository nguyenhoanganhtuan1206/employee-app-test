import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import MailService from '../../integrations/mail/mail.service';
import { LevelEntity } from '../../modules/user/entities/level.entity';
import LevelMapper from '../../modules/user/mappers/level.mapper';
import PositionMapper from '../../modules/user/mappers/position.mapper';
import UserMapper from '../../modules/user/mappers/user.mapper';
import { UserService } from '../../modules/user/services/user.service';
import { PositionEntity } from '../user/entities/position.entity';
import { UserEntity } from '../user/entities/user.entity';
import { AdminAttendanceController } from './controllers/admin-attendance.controller';
import { AdminTimeOffRequestController } from './controllers/admin-time-off-request.controller';
import { AdminVacationBalanceController } from './controllers/admin-vacation-balance.controller';
import { AdminWfhRequestController } from './controllers/admin-wfh-request.controller';
import { AttendanceController } from './controllers/attendance.controller';
import { TimeOffRequestController } from './controllers/time-off-request.controller';
import { WfhRequestController } from './controllers/wfh-request.controller';
import { AttendanceEntity } from './entities/attendance.entity';
import { TimeOffRequestEntity } from './entities/time-off-request.entity';
import { WfhRequestEntity } from './entities/wfh-request.entity';
import TimeOffRequestMapper from './mapper/time-off-request.mapper';
import WfhRequestMapper from './mapper/wfh-request.mapper';
import { AttendanceService } from './services/attendance.service';
import { TimeOffRequestService } from './services/time-off-request.service';
import { WfhRequestService } from './services/wfh-request.service';
import AttendanceValidator from './validators/attendance.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceEntity,
      TimeOffRequestEntity,
      WfhRequestEntity,
      UserEntity,
      PositionEntity,
      LevelEntity,
    ]),
  ],
  controllers: [
    AttendanceController,
    TimeOffRequestController,
    WfhRequestController,
    AdminTimeOffRequestController,
    AdminWfhRequestController,
    AdminVacationBalanceController,
    AdminAttendanceController,
  ],
  exports: [AttendanceService, TimeOffRequestService, WfhRequestService],
  providers: [
    AttendanceService,
    TimeOffRequestService,
    WfhRequestService,
    TimeOffRequestMapper,
    UserMapper,
    PositionMapper,
    LevelMapper,
    WfhRequestMapper,
    AttendanceValidator,
    UserService,
    MailService,
  ],
})
export class AttendanceModule {}
