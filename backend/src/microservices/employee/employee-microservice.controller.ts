import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmployeeService } from '../../employee/employee.service';
import { CreateEmployeeDto } from '../../employee/dto/create-employee.dto';
import { UpdateEmployeeDto } from '../../employee/dto/update-employee.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller()
export class EmployeeMicroserviceController {
  constructor(private readonly employeeService: EmployeeService) { }

  @MessagePattern('employee.create')
  async create(@Payload() data: CreateEmployeeDto) {
    return this.employeeService.create(data);
  }

  @MessagePattern('employee.findAll')
  async findAll(@Payload() pagination: PaginationDto) {
    return this.employeeService.findAll(pagination);
  }

  @MessagePattern('employee.findOne')
  async findOne(@Payload() data: { id: number }) {
    return this.employeeService.findOne(data.id);
  }

  @MessagePattern('employee.update')
  async update(@Payload() data: { id: number; dto: UpdateEmployeeDto }) {
    return this.employeeService.update(data.id, data.dto);
  }
}
