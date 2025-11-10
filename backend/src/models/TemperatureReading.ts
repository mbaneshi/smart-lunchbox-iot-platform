import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export enum OperationMode {
  IDLE = 'idle',
  HEATING = 'heating',
  COOLING = 'cooling',
  MAINTAINING = 'maintaining'
}

interface TemperatureReadingAttributes {
  id: string;
  deviceId: string;
  foodTemp: number;
  ambientTemp: number;
  humidity: number;
  timestamp: Date;
  unit: 'celsius' | 'fahrenheit';
  mode: OperationMode;
  targetTemp?: number;
  createdAt?: Date;
}

interface TemperatureReadingCreationAttributes extends Optional<TemperatureReadingAttributes, 'id' | 'createdAt' | 'timestamp'> {}

class TemperatureReading extends Model<TemperatureReadingAttributes, TemperatureReadingCreationAttributes> implements TemperatureReadingAttributes {
  public id!: string;
  public deviceId!: string;
  public foodTemp!: number;
  public ambientTemp!: number;
  public humidity!: number;
  public timestamp!: Date;
  public unit!: 'celsius' | 'fahrenheit';
  public mode!: OperationMode;
  public targetTemp?: number;
  public readonly createdAt!: Date;
}

TemperatureReading.init(
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
    foodTemp: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    ambientTemp: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    humidity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    unit: {
      type: DataTypes.ENUM('celsius', 'fahrenheit'),
      defaultValue: 'celsius'
    },
    mode: {
      type: DataTypes.ENUM(...Object.values(OperationMode)),
      defaultValue: OperationMode.IDLE
    },
    targetTemp: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'temperature_readings',
    timestamps: true,
    updatedAt: false,
    indexes: [
      { fields: ['deviceId'] },
      { fields: ['timestamp'] },
      { fields: ['deviceId', 'timestamp'] }
    ]
  }
);

export default TemperatureReading;
