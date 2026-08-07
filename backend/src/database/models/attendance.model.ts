import { Table, Column, Model, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Employee } from './employee.model';

export interface AttendanceAttributes {
  id: number;
  employeeId: number;
  attendanceDate: string;
  checkIn?: Date | null;
  checkOut?: Date | null;
}

export type AttendanceCreationAttributes = Optional<AttendanceAttributes, 'id' | 'checkIn' | 'checkOut'>;

@Table({ tableName: 'attendances', timestamps: true })
export class Attendance extends Model<AttendanceAttributes, AttendanceCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Employee)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare employeeId: number;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare attendanceDate: string;

  @Column({ type: DataType.DATE, allowNull: true })
  declare checkIn: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  declare checkOut: Date;

  @BelongsTo(() => Employee)
  employee?: Employee;
}
