import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Employee } from '../../database/models/employee.model';
import { User } from '../../database/models/user.model';
import { ActivityLog } from '../../database/models/activity-log.model';
import { EmployeeService } from '../../employee/employee.service';
import { EmployeeMicroserviceController } from './employee-microservice.controller';
import { RabbitModule } from '../../common/rabbitmq/rabbit.module';

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
        models: [Employee, User],
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
    SequelizeModule.forFeature([Employee, User]),
    RabbitModule,
  ],
  controllers: [EmployeeMicroserviceController],
  providers: [EmployeeService],
})
export class EmployeeMicroserviceModule { }
