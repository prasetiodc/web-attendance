export class CheckinCheckoutDto {
    attendanceDate!: string;
    checkIn!: Date;
    checkOut!: Date;
    employeeId!: number;
}

export class AttendanceHistoryQueryDto {
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
}
