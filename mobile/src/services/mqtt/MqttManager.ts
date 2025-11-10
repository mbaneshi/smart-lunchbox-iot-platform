import MqttClient from './MqttClient';
import { TemperatureReading, TemperatureControl } from '@/types/temperature.types';
import { DeviceCommand } from '@/types/device.types';

export class MqttManager {
  private deviceId: string | null = null;

  /**
   * Initialize MQTT connection for a device
   */
  async initialize(deviceId: string, brokerUrl: string, username?: string, password?: string): Promise<void> {
    this.deviceId = deviceId;

    await MqttClient.connect({
      brokerUrl,
      username,
      password,
      clientId: `app_${deviceId}_${Date.now()}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30000
    });

    // Subscribe to device topics
    await this.subscribeToDeviceTopics(deviceId);
  }

  /**
   * Subscribe to all device topics
   */
  private async subscribeToDeviceTopics(deviceId: string): Promise<void> {
    const topics = [
      `smartlunchbox/${deviceId}/temperature/current`,
      `smartlunchbox/${deviceId}/status/online`,
      `smartlunchbox/${deviceId}/alerts`,
      `smartlunchbox/${deviceId}/firmware/version`,
    ];

    for (const topic of topics) {
      await MqttClient.subscribe(topic, 1);
    }
  }

  /**
   * Send heating control command
   */
  async controlHeating(deviceId: string, control: TemperatureControl): Promise<void> {
    const topic = `smartlunchbox/${deviceId}/control/heat`;
    const payload = {
      action: control.action,
      targetTemp: control.targetTemp,
      maxDuration: control.maxDuration || 3600,
      mode: control.intensity || 'gentle',
      timestamp: Date.now()
    };

    await MqttClient.publish({
      topic,
      payload,
      qos: 1
    });
  }

  /**
   * Send cooling control command
   */
  async controlCooling(deviceId: string, control: TemperatureControl): Promise<void> {
    const topic = `smartlunchbox/${deviceId}/control/cool`;
    const payload = {
      action: control.action,
      targetTemp: control.targetTemp,
      maxDuration: control.maxDuration || 7200,
      mode: control.intensity || 'gentle',
      timestamp: Date.now()
    };

    await MqttClient.publish({
      topic,
      payload,
      qos: 1
    });
  }

  /**
   * Set target temperature
   */
  async setTargetTemperature(deviceId: string, temperature: number): Promise<void> {
    const topic = `smartlunchbox/${deviceId}/temperature/target`;
    const payload = {
      temperature,
      unit: 'celsius',
      timestamp: Date.now()
    };

    await MqttClient.publish({
      topic,
      payload,
      qos: 1
    });
  }

  /**
   * Send power control command
   */
  async controlPower(deviceId: string, action: 'on' | 'off'): Promise<void> {
    const topic = `smartlunchbox/${deviceId}/control/power`;
    const payload = {
      action,
      timestamp: Date.now()
    };

    await MqttClient.publish({
      topic,
      payload,
      qos: 1
    });
  }

  /**
   * Send timer schedule
   */
  async sendSchedule(deviceId: string, schedule: any): Promise<void> {
    const topic = `smartlunchbox/${deviceId}/timer/schedule`;
    const payload = {
      ...schedule,
      timestamp: Date.now()
    };

    await MqttClient.publish({
      topic,
      payload,
      qos: 1
    });
  }

  /**
   * Request firmware update
   */
  async requestFirmwareUpdate(deviceId: string, firmwareUrl: string, version: string): Promise<void> {
    const topic = `smartlunchbox/${deviceId}/firmware/update`;
    const payload = {
      version,
      url: firmwareUrl,
      timestamp: Date.now()
    };

    await MqttClient.publish({
      topic,
      payload,
      qos: 2 // Critical command
    });
  }

  /**
   * Subscribe to temperature updates
   */
  onTemperatureUpdate(callback: (data: TemperatureReading) => void): void {
    MqttClient.on('message', ({ topic, payload }) => {
      if (topic.includes('/temperature/current')) {
        try {
          const reading: TemperatureReading = {
            foodTemp: payload.temperature,
            ambientTemp: payload.ambient_temperature,
            humidity: payload.humidity,
            timestamp: payload.timestamp * 1000,
            unit: payload.unit || 'celsius',
            mode: payload.mode,
            targetTemp: payload.target_temperature
          };
          callback(reading);
        } catch (error) {
          console.error('Error parsing temperature data:', error);
        }
      }
    });
  }

  /**
   * Subscribe to device status updates
   */
  onDeviceStatusUpdate(callback: (status: string) => void): void {
    MqttClient.on('message', ({ topic, payload }) => {
      if (topic.includes('/status/online')) {
        callback(typeof payload === 'string' ? payload : payload.status);
      }
    });
  }

  /**
   * Subscribe to alerts
   */
  onAlert(callback: (alert: any) => void): void {
    MqttClient.on('message', ({ topic, payload }) => {
      if (topic.includes('/alerts')) {
        callback(payload);
      }
    });
  }

  /**
   * Subscribe to firmware version updates
   */
  onFirmwareVersion(callback: (version: string) => void): void {
    MqttClient.on('message', ({ topic, payload }) => {
      if (topic.includes('/firmware/version')) {
        callback(typeof payload === 'string' ? payload : payload.version);
      }
    });
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return MqttClient.getConnectionStatus();
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    MqttClient.disconnect();
    this.deviceId = null;
  }
}

export default new MqttManager();
