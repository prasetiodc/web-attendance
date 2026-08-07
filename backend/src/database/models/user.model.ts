import { Table, Column, Model, PrimaryKey, AutoIncrement, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { Employee } from './employee.model';

export interface UserAttributes {
  id: number;
  employeeId?: number | null;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  lastLogin?: Date | null;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'employeeId' | 'role' | 'isActive' | 'lastLogin'>;

@Table({ tableName: 'users', timestamps: true })
export class User extends Model<UserAttributes, UserCreationAttributes> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Employee)
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare employeeId?: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare password: string;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'employee' })
  declare role: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  declare isActive: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  declare lastLogin?: Date;

  @BelongsTo(() => Employee)
  employee?: Employee;
}
