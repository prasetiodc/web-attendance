import { Table, Column, Model, PrimaryKey, AutoIncrement, DataType, HasOne, HasMany } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { User } from './user.model';
import { Attendance } from './attendance.model';

export interface EmployeeAttributes {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  photo?: string | null;
}

export type EmployeeCreationAttributes = Optional<EmployeeAttributes, 'id' | 'phone' | 'position' | 'photo'>;

@Table({ tableName: 'employees', timestamps: true })
export class Employee extends Model<EmployeeAttributes, EmployeeCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare employeeCode: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare fullName: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare phone?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare position?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare photo?: string;

  @HasOne(() => User)
  user?: User;

  @HasMany(() => Attendance)
  attendances?: Attendance[];
}
