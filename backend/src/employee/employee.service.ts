import * as bcrypt from 'bcryptjs';
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { Employee } from "../database/models/employee.model";
import { User } from "../database/models/user.model";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { PaginationDto, PaginatedResult } from "../common/dto/pagination.dto";

import * as fs from 'fs';
import * as path from 'path';

import { RabbitService } from '../common/rabbitmq/rabbit.service';

@Injectable()
export class EmployeeService {
    constructor(
        @InjectModel(Employee)
        private readonly employeeModel: typeof Employee,
        @InjectModel(User)
        private readonly userModel: typeof User,
        private readonly sequelize: Sequelize,
        private readonly rabbitService: RabbitService,
    ) { }

    private handleBase64Photo(photoStr?: string): string | undefined {
        if (!photoStr) return photoStr;
        if (photoStr.startsWith('data:image/')) {
            const matches = photoStr.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
            if (matches) {
                const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                const base64Data = matches[2];
                const uploadDir = path.join(process.cwd(), 'uploads', 'employees');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                const filename = `employee-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
                const filePath = path.join(uploadDir, filename);
                fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
                return `/uploads/employees/${filename}`;
            }
        }
        return photoStr;
    }

    async create(createEmployeeDto: CreateEmployeeDto) {
        const existingUser = await this.userModel.findOne({ where: { email: createEmployeeDto.email } });
        if (existingUser) {
            throw new ConflictException('Email is already registered');
        }

        const existingEmployee = await this.employeeModel.findOne({ where: { employeeCode: createEmployeeDto.employeeCode } });
        if (existingEmployee) {
            throw new ConflictException('Employee code is already registered');
        }

        const photoPath = this.handleBase64Photo(createEmployeeDto.photo);

        const transaction = await this.sequelize.transaction();
        try {
            const employee = await this.employeeModel.create({
                employeeCode: createEmployeeDto.employeeCode,
                fullName: createEmployeeDto.fullName,
                email: createEmployeeDto.email,
                phone: createEmployeeDto.phone,
                position: createEmployeeDto.position,
                photo: photoPath,
            }, { transaction });

            const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);

            const user = await this.userModel.create({
                employeeId: employee.id,
                email: createEmployeeDto.email,
                password: hashedPassword,
                role: createEmployeeDto.role || 'employee',
                isActive: true,
            }, { transaction });

            await transaction.commit();

            return {
                employee,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    employeeId: user.employeeId,
                },
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async findAll(pagination?: PaginationDto): Promise<PaginatedResult<Employee>> {
        const page = Number(pagination?.page) || 1;
        const limit = Number(pagination?.limit) || 10;
        const offset = (page - 1) * limit;

        const { rows, count } = await this.employeeModel.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']],
        });

        return {
            data: rows,
            meta: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        };
    }

    async findOne(id: number): Promise<Employee> {
        const employee = await this.employeeModel.findByPk(id);
        if (!employee) {
            throw new NotFoundException(`Employee with ID ${id} not found`);
        }
        return employee;
    }

    async update(id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
        const employee = await this.findOne(id);
        const previousState = {
            fullName: employee.fullName,
            phone: employee.phone,
            position: employee.position,
            photo: employee.photo,
        };

        if (updateEmployeeDto.photo) {
            updateEmployeeDto.photo = this.handleBase64Photo(updateEmployeeDto.photo);
        }
        await employee.update(updateEmployeeDto);

        // Publish data stream event to RabbitMQ message queue for activity logging
        await this.rabbitService.publishLog('EMPLOYEE_UPDATED', 'EMPLOYEE_SERVICE', {
            employeeId: employee.id,
            employeeCode: employee.employeeCode,
            previousState,
            updatedFields: updateEmployeeDto,
            updatedAt: new Date().toISOString(),
        });

        return employee;
    }
}