export interface Device {
  id: string;
  userId: string;
  name: string;
  firmwareVersion: string;
  lastOnline: Date;
  registeredAt: Date;
  wifiSSID: string;
  status: DeviceStatus;
  settings?: DeviceSettings;
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ERROR = 'error',
  UPDATING = 'updating'
}

export interface DeviceSettings {
  temperatureUnit: 'celsius' | 'fahrenheit';
  notificationsEnabled: boolean;
  autoUpdate: boolean;
  safetyLimits: SafetyLimits;
}

export interface SafetyLimits {
  maxTemp: number;
  emergencyTemp: number;
  maxHeatingTime: number; // seconds
  maxCoolingTime: number; // seconds
  minBatteryLevel: number; // percentage
}

export interface FirmwareInfo {
  current: string;
  latest: string;
  updateAvailable: boolean;
  releaseNotes: string;
  downloadUrl: string;
  fileSize: number;
  mandatory: boolean;
  minSupportedVersion: string;
}

export interface DeviceCommand {
  deviceId: string;
  command: DeviceCommandType;
  payload: any;
  timestamp: number;
}

export enum DeviceCommandType {
  HEAT_START = 'heat_start',
  HEAT_STOP = 'heat_stop',
  COOL_START = 'cool_start',
  COOL_STOP = 'cool_stop',
  POWER_OFF = 'power_off',
  SET_TARGET_TEMP = 'set_target_temp',
  UPDATE_FIRMWARE = 'update_firmware'
}
