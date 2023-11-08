import { Controller, Get, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';

import { MetricsService } from './metric.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getMetrics(@Res() res: Response) {
    const metrics = await this.metricsService.getMetrics();

    return res.send(metrics);
  }
}
