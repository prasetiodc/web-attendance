import { Injectable } from "@nestjs/common";
import { AttendanceHistoryQueryDto, CheckinCheckoutDto } from "./dto/attendance.dto";
import { InjectModel } from "@nestjs/sequelize";
import { Attendance } from "src/database/models/attendance.model";
import { Employee } from "src/database/models/employee.model";
import { Op, WhereOptions } from "sequelize";

@Injectable()
export class AttendanceService {
    constructor(
        @InjectModel(Attendance)
        private readonly attendanceModel: typeof Attendance,
    ) { }

    async checkin(checkinCheckoutDto: CheckinCheckoutDto) {
        try {
            return this.attendanceModel.create({
                attendanceDate: checkinCheckoutDto.attendanceDate,
                checkIn: checkinCheckoutDto.checkIn,
                employeeId: checkinCheckoutDto.employeeId,
            });
        } catch (error) {
            throw error;
        }
    }

    async checkout(checkinCheckoutDto: CheckinCheckoutDto) {
        try {
            return this.attendanceModel.update({
                checkOut: checkinCheckoutDto.checkIn,
            }, {
                where: {
                    employeeId: checkinCheckoutDto.employeeId,
                    attendanceDate: checkinCheckoutDto.attendanceDate,
                },
            });
        } catch (error) {
            throw error;
        }
    }

    async findAllByEmployeeId(employeeId: number, query?: AttendanceHistoryQueryDto) {
        try {
            const whereClause: WhereOptions = { employeeId };

            if (query?.dateFrom && query?.dateTo) {
                whereClause.attendanceDate = {
                    [Op.between]: [query.dateFrom, query.dateTo],
                };
            } else if (query?.dateFrom) {
                whereClause.attendanceDate = {
                    [Op.gte]: query.dateFrom,
                };
            } else if (query?.dateTo) {
                whereClause.attendanceDate = {
                    [Op.lte]: query.dateTo,
                };
            }

            const page = Number(query?.page) || 1;
            const limit = Number(query?.limit) || 10;
            const offset = (page - 1) * limit;

            const { rows, count } = await this.attendanceModel.findAndCountAll({
                where: whereClause,

                order: [['attendanceDate', 'DESC']],
                limit,
                offset,
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
        } catch (error) {
            throw error;
        }
    }

    async findAllForAdmin(query?: AttendanceHistoryQueryDto) {
        try {
            const whereClause: WhereOptions = {};

            if (query?.dateFrom && query?.dateTo) {
                whereClause.attendanceDate = {
                    [Op.between]: [query.dateFrom, query.dateTo],
                };
            } else if (query?.dateFrom) {
                whereClause.attendanceDate = {
                    [Op.gte]: query.dateFrom,
                };
            } else if (query?.dateTo) {
                whereClause.attendanceDate = {
                    [Op.lte]: query.dateTo,
                };
            }

            const page = Number(query?.page) || 1;
            const limit = Number(query?.limit) || 10;
            const offset = (page - 1) * limit;

            const employeeWhere: WhereOptions = {};
            if (query?.search) {
                const searchPattern = `%${query.search}%`;
                employeeWhere[Op.or as unknown as keyof WhereOptions] = [
                    { fullName: { [Op.like]: searchPattern } },
                    { employeeCode: { [Op.like]: searchPattern } },
                ];
            }

            const { rows, count } = await this.attendanceModel.findAndCountAll({
                where: whereClause,
                include: [{
                    model: Employee,
                    attributes: ['id', 'employeeCode', 'fullName', 'email', 'position'],
                    where: Object.keys(employeeWhere).length > 0 || employeeWhere[Op.or as unknown as keyof WhereOptions] ? employeeWhere : undefined,
                    required: !!query?.search,
                }],
                order: [['attendanceDate', 'DESC']],
                limit,
                offset,
                distinct: true,
                subQuery: false,
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
        } catch (error) {
            throw error;
        }
    }
}