export class CreateEmployeeDto {
    employeeCode!: string;
    fullName!: string;
    email!: string;
    phone?: string;
    position?: string;
    photo?: string;
    password!: string;
    role?: string;
}
