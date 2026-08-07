import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AttendanceService } from '../../attendance/attendance.service';
import { AttendanceHistoryQueryDto, CheckinCheckoutDto } from '../../attendance/dto/attendance.dto';

@Controller()
export class AttendanceMicroserviceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @MessagePattern('attendance.checkin')
  async checkin(@Payload() data: CheckinCheckoutDto) {
    return this.attendanceService.checkin(data);
  }

  @MessagePattern('attendance.checkout')
  async checkout(@Payload() data: CheckinCheckoutDto) {
    return this.attendanceService.checkout(data);
  }

  @MessagePattern('attendance.history')
  async getHistory(@Payload() data: { employeeId: number; query: AttendanceHistoryQueryDto }) {
    return this.attendanceService.findAllByEmployeeId(data.employeeId, data.query);
  }

  @MessagePattern('attendance.adminHistory')
  async getAdminHistory(@Payload() query: AttendanceHistoryQueryDto) {
    return this.attendanceService.findAllForAdmin(query);
  }
}
