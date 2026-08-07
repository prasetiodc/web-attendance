import { Table, Column, Model, PrimaryKey, AutoIncrement, DataType, CreatedAt } from 'sequelize-typescript';

@Table({ tableName: 'activity_logs', updatedAt: false })
export class ActivityLog extends Model<ActivityLog> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare eventName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare serviceName: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare payload: string;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;
}
