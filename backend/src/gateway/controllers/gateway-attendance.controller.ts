import {
  Controller, Get, Post, Put, Body, Query,
  UseGuards, Inject, OnModuleInit,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('api/attendance')
export class GatewayAttendanceController implements OnModuleInit {
  constructor(
    @Inject('ATTENDANCE_SERVICE') private readonly attendanceClient: ClientProxy,
  ) { }

  async onModuleInit() {
    await this.attendanceClient.connect();
  }

  @Post('checkin')
  async checkin(@Body() body: Record<string, any>) {
    return firstValueFrom(this.attendanceClient.send('attendance.checkin', body));
  }

  @Put('checkout')
  async checkout(@Body() body: Record<string, any>) {
    return firstValueFrom(this.attendanceClient.send('attendance.checkout', body));
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(
    @CurrentUser('employeeId') employeeId: number,
    @Query() query: Record<string, any>,
  ) {
    return firstValueFrom(
      this.attendanceClient.send('attendance.history', { employeeId, query }),
    );
  }

  @Get('admin/history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAdminHistory(@Query() query: Record<string, any>) {
    return firstValueFrom(this.attendanceClient.send('attendance.adminHistory', query));
  }
}
