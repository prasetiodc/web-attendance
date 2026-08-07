import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { JwtModule } from "@nestjs/jwt";
import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "./attendance.service";
import { Attendance } from "src/database/models/attendance.model";

@Module({
    imports: [
        SequelizeModule.forFeature([Attendance]),
        JwtModule,
    ],
    controllers: [AttendanceController],
    providers: [AttendanceService],
    exports: [AttendanceService],
})
export class AttendanceModule {}