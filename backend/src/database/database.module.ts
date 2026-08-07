import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { Employee } from './models/employee.model';
import { Attendance } from './models/attendance.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Employee, Attendance]),
  ],
  exports: [SequelizeModule],
})
export class DatabaseModule { }
