import { Module } from '@nestjs/common';

import { MetricsController } from './metric.controller';
import { MetricsService } from './metric.service';

@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
