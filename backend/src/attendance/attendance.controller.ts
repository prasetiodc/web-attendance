import { Body, Controller, Get, Post, Put, Query, UseGuards } from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { AttendanceHistoryQueryDto, CheckinCheckoutDto } from "./dto/attendance.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";

@Controller('api/attendance')
export class AttendanceController {
constructor(private readonly attendanceService: AttendanceService) { }

    @Post('/checkin')
    async checkin(@Body() checkinCheckoutDto: CheckinCheckoutDto) {
        return this.attendanceService.checkin(checkinCheckoutDto);
    }

    @Put('/checkout')
    async checkout(@Body() checkinCheckoutDto: CheckinCheckoutDto) {
        return this.attendanceService.checkout(checkinCheckoutDto);
    }

    @Get('/history')
    @UseGuards(JwtAuthGuard)
    async getAttendanceHistory(
        @CurrentUser('employeeId') employeeId: number,
        @Query() query: AttendanceHistoryQueryDto,
    ) {
        return this.attendanceService.findAllByEmployeeId(employeeId, query);
    }

    @Get('/admin/history')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async getAllAttendanceHistoryForAdmin(
        @Query() query: AttendanceHistoryQueryDto,
    ) {
        return this.attendanceService.findAllForAdmin(query);
    }
}