import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { PrismaService } from '../prisma.service'

@Module({
  controllers: [StatisticsController],
  providers: [StatisticsService,PrismaService]
})
export class StatisticsModule {}
