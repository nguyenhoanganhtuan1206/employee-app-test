import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LevelEntity } from '../../modules/user/entities/level.entity';
import { PositionEntity } from '../../modules/user/entities/position.entity';
import { UserEntity } from '../../modules/user/entities/user.entity';
import LevelMapper from '../../modules/user/mappers/level.mapper';
import PositionMapper from '../../modules/user/mappers/position.mapper';
import UserMapper from '../../modules/user/mappers/user.mapper';
import { AdminDeviceController } from './controllers/admin-device.controller';
import { AdminDeviceRepairHistoryController } from './controllers/admin-device-repair-history.controller';
import { AdminDeviceModelController } from './controllers/admin-model.controller';
import { AdminDeviceRepairRequestController } from './controllers/admin-repair-request.controller';
import { AdminDeviceTypeController } from './controllers/admin-type.controller';
import { DeviceRepairRequestController } from './controllers/repair-request.controller';
import { DeviceEntity } from './entities/device.entity';
import { DeviceAssigneeHistoryEntity } from './entities/device-assiginee-history.entity';
import { DeviceModelEntity } from './entities/device-model.entity';
import { DeviceTypeEntity } from './entities/device-type.entity';
import { RepairHistoryEntity } from './entities/repair-history.entity';
import { RepairRequestEntity } from './entities/repair-request.entity';
import DeviceMapper from './mappers/device.mapper';
import DeviceModelMapper from './mappers/device-model.mapper';
import DeviceTypeMapper from './mappers/device-type.mapper';
import { DeviceConfigrationService } from './services/device-configuration.service';
import { DeviceManagementService } from './services/device-management.service';
import { RepairRequestService } from './services/repair-request.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DeviceModelEntity,
      DeviceTypeEntity,
      DeviceEntity,
      RepairHistoryEntity,
      RepairRequestEntity,
      DeviceAssigneeHistoryEntity,
      UserEntity,
      PositionEntity,
      LevelEntity,
    ]),
  ],
  controllers: [
    AdminDeviceRepairRequestController,
    DeviceRepairRequestController,
    AdminDeviceTypeController,
    AdminDeviceModelController,
    AdminDeviceController,
    AdminDeviceRepairHistoryController,
  ],
  exports: [],
  providers: [
    DeviceConfigrationService,
    DeviceManagementService,
    RepairRequestService,
    DeviceTypeMapper,
    DeviceModelMapper,
    DeviceMapper,
    UserMapper,
    PositionMapper,
    LevelMapper,
  ],
})
export class DeviceModule {}
