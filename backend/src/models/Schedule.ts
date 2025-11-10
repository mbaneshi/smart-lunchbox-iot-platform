import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { OperationMode } from './TemperatureReading';

export enum RecurringType {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKDAYS = 'weekdays',
  WEEKENDS = 'weekends',
  CUSTOM = 'custom'
}

interface ScheduleAttributes {
  id: string;
  deviceId: string;
  name: string;
  mode: OperationMode;
  targetTemp: number;
  startTime: Date;
  duration?: number;
  recurring: {
    enabled: boolean;
    pattern: RecurringType;
    daysOfWeek?: number[];
  };
  enabled: boolean;
  notifications: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ScheduleCreationAttributes extends Optional<ScheduleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Schedule extends Model<ScheduleAttributes, ScheduleCreationAttributes> implements ScheduleAttributes {
  public id!: string;
  public deviceId!: string;
  public name!: string;
  public mode!: OperationMode;
  public targetTemp!: number;
  public startTime!: Date;
  public duration?: number;
  public recurring!: {
    enabled: boolean;
    pattern: RecurringType;
    daysOfWeek?: number[];
  };
  public enabled!: boolean;
  public notifications!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Schedule.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    deviceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'devices',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mode: {
      type: DataTypes.ENUM(...Object.values(OperationMode)),
      allowNull: false
    },
    targetTemp: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    recurring: {
      type: DataTypes.JSONB,
      defaultValue: {
        enabled: false,
        pattern: RecurringType.ONCE,
        daysOfWeek: []
      }
    },
    enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  },
  {
    sequelize,
    tableName: 'schedules',
    timestamps: true,
    indexes: [
      { fields: ['deviceId'] },
      { fields: ['enabled'] },
      { fields: ['startTime'] }
    ]
  }
);

export default Schedule;
