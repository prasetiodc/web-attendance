import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { User } from './database/models/user.model';
import { Employee } from './database/models/employee.model';
import { Attendance } from './database/models/attendance.model';
import { ActivityLog } from './database/models/activity-log.model';
import { EmployeeModule } from './employee/employee.module';
import { AttendanceModule } from './attendance/attendance.module';
import { RabbitModule } from './common/rabbitmq/rabbit.module';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
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
        models: [User, Employee, Attendance],
        autoLoadModels: true,
        synchronize: false,
      }),
    }),
    SequelizeModule.forRootAsync({
      name: 'loggingConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'root'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_LOG_DATABASE', 'absenteeism_logs'),
        models: [ActivityLog],
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
    DatabaseModule,
    AuthModule,
    EmployeeModule,
    AttendanceModule,
    RabbitModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
