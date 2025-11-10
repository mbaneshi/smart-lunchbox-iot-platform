import User from './User';
import Device from './Device';
import TemperatureReading from './TemperatureReading';
import Schedule from './Schedule';
import Alert from './Alert';

// Define model associations
User.hasMany(Device, {
  foreignKey: 'userId',
  as: 'devices',
  onDelete: 'CASCADE'
});

Device.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Device.hasMany(TemperatureReading, {
  foreignKey: 'deviceId',
  as: 'temperatureReadings',
  onDelete: 'CASCADE'
});

TemperatureReading.belongsTo(Device, {
  foreignKey: 'deviceId',
  as: 'device'
});

Device.hasMany(Schedule, {
  foreignKey: 'deviceId',
  as: 'schedules',
  onDelete: 'CASCADE'
});

Schedule.belongsTo(Device, {
  foreignKey: 'deviceId',
  as: 'device'
});

Device.hasMany(Alert, {
  foreignKey: 'deviceId',
  as: 'alerts',
  onDelete: 'CASCADE'
});

Alert.belongsTo(Device, {
  foreignKey: 'deviceId',
  as: 'device'
});

export {
  User,
  Device,
  TemperatureReading,
  Schedule,
  Alert
};
