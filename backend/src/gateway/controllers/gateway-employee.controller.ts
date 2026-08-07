import {
  Controller, Get, Post, Patch, Body, Param, Query,
  ParseIntPipe, UseGuards, UseInterceptors, UploadedFile,
  Inject, OnModuleInit,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

const multerStorage = diskStorage({
  destination: './uploads/employees',
  filename: (_req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `employee-${uniqueSuffix}${ext}`);
  },
});

@Controller('api/employee')
export class GatewayEmployeeController implements OnModuleInit {
  constructor(
    @Inject('EMPLOYEE_SERVICE') private readonly employeeClient: ClientProxy,
  ) { }

  async onModuleInit() {
    await this.employeeClient.connect();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('photoFile', { storage: multerStorage }))
  async create(
    @Body() createEmployeeDto: Record<string, any>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      createEmployeeDto.photo = `/uploads/employees/${file.filename}`;
    }
    return firstValueFrom(this.employeeClient.send('employee.create', createEmployeeDto));
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() pagination: { page?: string; limit?: string }) {
    return firstValueFrom(this.employeeClient.send('employee.findAll', pagination));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.employeeClient.send('employee.findOne', { id }));
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photoFile', { storage: multerStorage }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: Record<string, any>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateEmployeeDto.photo = `/uploads/employees/${file.filename}`;
    }
    return firstValueFrom(this.employeeClient.send('employee.update', { id, dto: updateEmployeeDto }));
  }
}
