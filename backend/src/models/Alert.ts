import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export enum AlertType {
  TEMP_TOO_HIGH = 'temperature_too_high',
  TEMP_TOO_LOW = 'temperature_too_low',
  DEVICE_OFFLINE = 'device_offline',
  TIMER_COMPLETE = 'timer_complete',
  SAFETY_SHUTDOWN = 'safety_shutdown',
  BATTERY_LOW = 'battery_low',
  FIRMWARE_UPDATE = 'firmware_update_available'
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

interface AlertAttributes {
  id: string;
  deviceId: string;
  type: AlertType;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  severity: AlertSeverity;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AlertCreationAttributes extends Optional<AlertAttributes, 'id' | 'createdAt' | 'updatedAt' | 'timestamp' | 'acknowledged'> {}

class Alert extends Model<AlertAttributes, AlertCreationAttributes> implements AlertAttributes {
  public id!: string;
  public deviceId!: string;
  public type!: AlertType;
  public message!: string;
  public timestamp!: Date;
  public acknowledged!: boolean;
  public severity!: AlertSeverity;
  public metadata?: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Alert.init(
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
    type: {
      type: DataTypes.ENUM(...Object.values(AlertType)),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    acknowledged: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    severity: {
      type: DataTypes.ENUM(...Object.values(AlertSeverity)),
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'alerts',
    timestamps: true,
    indexes: [
      { fields: ['deviceId'] },
      { fields: ['type'] },
      { fields: ['timestamp'] },
      { fields: ['acknowledged'] }
    ]
  }
);

export default Alert;
