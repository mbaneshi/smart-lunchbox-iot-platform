export const APP_CONFIG = {
  // App Information
  APP_NAME: 'Smart Lunchbox',
  APP_VERSION: '1.0.0',

  // API Configuration
  API_BASE_URL: process.env.API_BASE_URL || 'https://api.smartlunchbox.com',
  API_TIMEOUT: 30000,

  // MQTT Configuration
  MQTT_BROKER_URL: process.env.MQTT_BROKER_URL || 'wss://mqtt.smartlunchbox.com:9001',
  MQTT_USERNAME: process.env.MQTT_USERNAME,
  MQTT_PASSWORD: process.env.MQTT_PASSWORD,

  // Temperature Settings
  TEMPERATURE: {
    MIN: 4,
    MAX: 65,
    EMERGENCY_MAX: 70,
    DEFAULT_UNIT: 'celsius' as 'celsius' | 'fahrenheit',
    UPDATE_INTERVAL: 2000, // ms
    CONNECTION_TIMEOUT: 10000, // ms
  },

  // Safety Limits
  SAFETY: {
    MAX_TEMP: 65,
    EMERGENCY_TEMP: 70,
    MAX_HEATING_TIME: 3600, // seconds
    MAX_COOLING_TIME: 7200, // seconds
    MIN_BATTERY_LEVEL: 15, // percentage
  },

  // Cooling Limits
  COOLING: {
    MIN_TEMP: 4,
    MAX_TEMP: 20,
    MAX_DURATION: 7200, // seconds
    MIN_AMBIENT: 15, // won't cool if ambient < 15°C
  },

  // Notifications
  NOTIFICATIONS: {
    ENABLED: true,
    SOUND: true,
    VIBRATE: true,
  },

  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: '@smartlunchbox/auth_token',
    REFRESH_TOKEN: '@smartlunchbox/refresh_token',
    USER_ID: '@smartlunchbox/user_id',
    DEVICE_ID: '@smartlunchbox/device_id',
    PREFERENCES: '@smartlunchbox/preferences',
  },

  // Development
  DEBUG: __DEV__,
  LOG_LEVEL: __DEV__ ? 'debug' : 'error',
};
