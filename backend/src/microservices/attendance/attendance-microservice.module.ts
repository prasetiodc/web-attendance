import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Attendance } from '../../database/models/attendance.model';
import { Employee } from '../../database/models/employee.model';
import { AttendanceService } from '../../attendance/attendance.service';
import { AttendanceMicroserviceController } from './attendance-microservice.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_DATABASE', 'absenteeism'),
        models: [Attendance, Employee],
        autoLoadModels: true,
        synchronize: false,
      }),
    }),
    SequelizeModule.forFeature([Attendance]),
  ],
  controllers: [AttendanceMicroserviceController],
  providers: [AttendanceService],
})
export class AttendanceMicroserviceModule { }
