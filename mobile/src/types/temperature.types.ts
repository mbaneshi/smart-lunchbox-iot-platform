export interface TemperatureReading {
  foodTemp: number;
  ambientTemp: number;
  humidity: number;
  timestamp: number;
  unit: 'celsius' | 'fahrenheit';
  mode: OperationMode;
  targetTemp?: number;
}

export enum OperationMode {
  IDLE = 'idle',
  HEATING = 'heating',
  COOLING = 'cooling',
  MAINTAINING = 'maintaining'
}

export interface TemperatureHistory {
  deviceId: string;
  readings: TemperatureReading[];
  timeRange: TimeRange;
}

export enum TimeRange {
  ONE_HOUR = '1h',
  SIX_HOURS = '6h',
  TWELVE_HOURS = '12h',
  ONE_DAY = '24h',
  ONE_WEEK = '7d'
}

export interface TemperatureAlert {
  id: string;
  deviceId: string;
  type: AlertType;
  message: string;
  timestamp: number;
  acknowledged: boolean;
  severity: AlertSeverity;
}

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

export interface TemperaturePreset {
  id: string;
  name: string;
  temperature: number;
  icon: string;
  mode: OperationMode;
}

export interface TemperatureControl {
  action: 'start' | 'stop';
  mode: OperationMode;
  targetTemp: number;
  maxDuration?: number; // seconds
  intensity?: 'gentle' | 'rapid';
}

export interface TemperatureZone {
  name: string;
  minTemp: number;
  maxTemp: number;
  color: string;
  icon: string;
}

export const TEMPERATURE_ZONES: TemperatureZone[] = [
  {
    name: 'Cold',
    minTemp: -Infinity,
    maxTemp: 10,
    color: '#3498db',
    icon: 'snowflake'
  },
  {
    name: 'Cool',
    minTemp: 10,
    maxTemp: 20,
    color: '#1abc9c',
    icon: 'snowflake-variant'
  },
  {
    name: 'Room',
    minTemp: 20,
    maxTemp: 30,
    color: '#2ecc71',
    icon: 'thermometer'
  },
  {
    name: 'Warm',
    minTemp: 30,
    maxTemp: 45,
    color: '#f39c12',
    icon: 'weather-sunny'
  },
  {
    name: 'Hot',
    minTemp: 45,
    maxTemp: Infinity,
    color: '#e74c3c',
    icon: 'fire'
  }
];

export const DEFAULT_PRESETS: TemperaturePreset[] = [
  {
    id: 'deep_cool',
    name: 'Deep Cool',
    temperature: 4,
    icon: 'snowflake',
    mode: OperationMode.COOLING
  },
  {
    id: 'cool',
    name: 'Cool',
    temperature: 10,
    icon: 'snowflake-variant',
    mode: OperationMode.COOLING
  },
  {
    id: 'warm',
    name: 'Warm',
    temperature: 40,
    icon: 'weather-sunny',
    mode: OperationMode.HEATING
  },
  {
    id: 'hot',
    name: 'Hot',
    temperature: 55,
    icon: 'fire',
    mode: OperationMode.HEATING
  }
];
