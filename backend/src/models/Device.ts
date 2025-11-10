import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ERROR = 'error',
  UPDATING = 'updating'
}

interface DeviceAttributes {
  id: string;
  userId: string;
  name: string;
  firmwareVersion: string;
  lastOnline: Date;
  registeredAt: Date;
  wifiSSID: string;
  status: DeviceStatus;
  settings: {
    temperatureUnit: 'celsius' | 'fahrenheit';
    notificationsEnabled: boolean;
    autoUpdate: boolean;
    safetyLimits: {
      maxTemp: number;
      emergencyTemp: number;
      maxHeatingTime: number;
      maxCoolingTime: number;
      minBatteryLevel: number;
    };
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface DeviceCreationAttributes extends Optional<DeviceAttributes, 'id' | 'createdAt' | 'updatedAt' | 'lastOnline' | 'registeredAt'> {}

class Device extends Model<DeviceAttributes, DeviceCreationAttributes> implements DeviceAttributes {
  public id!: string;
  public userId!: string;
  public name!: string;
  public firmwareVersion!: string;
  public lastOnline!: Date;
  public registeredAt!: Date;
  public wifiSSID!: string;
  public status!: DeviceStatus;
  public settings!: {
    temperatureUnit: 'celsius' | 'fahrenheit';
    notificationsEnabled: boolean;
    autoUpdate: boolean;
    safetyLimits: {
      maxTemp: number;
      emergencyTemp: number;
      maxHeatingTime: number;
      maxCoolingTime: number;
      minBatteryLevel: number;
    };
  };
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Device.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firmwareVersion: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '1.0.0'
    },
    lastOnline: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    registeredAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    wifiSSID: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(...Object.values(DeviceStatus)),
      defaultValue: DeviceStatus.OFFLINE
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        temperatureUnit: 'celsius',
        notificationsEnabled: true,
        autoUpdate: true,
        safetyLimits: {
          maxTemp: 70,
          emergencyTemp: 80,
          maxHeatingTime: 7200,
          maxCoolingTime: 7200,
          minBatteryLevel: 15
        }
      }
    }
  },
  {
    sequelize,
    tableName: 'devices',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['lastOnline'] }
    ]
  }
);

export default Device;
