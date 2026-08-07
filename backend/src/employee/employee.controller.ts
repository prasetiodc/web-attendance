import { Controller, Get, Post, Body, Param, Patch, ParseIntPipe, Query, UseInterceptors, UploadedFile } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { EmployeeService } from "./employee.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { PaginationDto } from "../common/dto/pagination.dto";

const multerStorage = diskStorage({
    destination: './uploads/employees',
    filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `employee-${uniqueSuffix}${ext}`);
    },
});

@Controller('api/employee')
export class EmployeeController {
    constructor(private readonly employeeService: EmployeeService) { }

    @Post()
    @UseInterceptors(FileInterceptor('photoFile', { storage: multerStorage }))
    async create(
        @Body() createEmployeeDto: CreateEmployeeDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            createEmployeeDto.photo = `/uploads/employees/${file.filename}`;
        }
        return this.employeeService.create(createEmployeeDto);
    }

    @Get()
    async findAll(@Query() pagination: PaginationDto) {
        return this.employeeService.findAll(pagination);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.employeeService.findOne(id);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('photoFile', { storage: multerStorage }))
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateEmployeeDto: UpdateEmployeeDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        if (file) {
            updateEmployeeDto.photo = `/uploads/employees/${file.filename}`;
        }
        return this.employeeService.update(id, updateEmployeeDto);
    }
}