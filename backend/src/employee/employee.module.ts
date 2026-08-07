import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Employee } from "../database/models/employee.model";
import { User } from "../database/models/user.model";
import { EmployeeService } from "./employee.service";
import { EmployeeController } from "./employee.controller";
import { RabbitModule } from "../common/rabbitmq/rabbit.module";

@Module({
    imports: [
        SequelizeModule.forFeature([Employee, User]),
        RabbitModule,
    ],
    providers: [EmployeeService],
    controllers: [EmployeeController],
    exports: [EmployeeService],
})
export class EmployeeModule { }
