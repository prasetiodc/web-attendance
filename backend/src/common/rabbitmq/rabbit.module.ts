import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { ActivityLog } from '../../database/models/activity-log.model';
import { RabbitService } from './rabbit.service';

@Module({
  imports: [
    ConfigModule,
    SequelizeModule.forFeature([ActivityLog], 'loggingConnection'),
  ],
  providers: [RabbitService],
  exports: [RabbitService],
})
export class RabbitModule { }
