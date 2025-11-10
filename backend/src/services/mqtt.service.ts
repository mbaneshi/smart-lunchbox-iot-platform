import mqtt, { MqttClient } from 'mqtt';
import logger from '../utils/logger';

class MqttService {
  private client: MqttClient | null = null;
  private readonly brokerUrl: string;
  private readonly username: string;
  private readonly password: string;
  private readonly clientId: string;

  constructor() {
    this.brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    this.username = process.env.MQTT_USERNAME || '';
    this.password = process.env.MQTT_PASSWORD || '';
    this.clientId = process.env.MQTT_CLIENT_ID || 'backend_server';
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.client = mqtt.connect(this.brokerUrl, {
          clientId: this.clientId,
          username: this.username,
          password: this.password,
          clean: true,
          reconnectPeriod: 5000,
          connectTimeout: 30000
        });

        this.client.on('connect', () => {
          logger.info('MQTT broker connected');
          this.setupSubscriptions();
          resolve();
        });

        this.client.on('error', (error) => {
          logger.error('MQTT connection error:', error);
          reject(error);
        });

        this.client.on('offline', () => {
          logger.warn('MQTT client offline');
        });

        this.client.on('reconnect', () => {
          logger.info('MQTT client reconnecting...');
        });

        this.client.on('message', this.handleMessage.bind(this));

      } catch (error) {
        logger.error('Failed to create MQTT client:', error);
        reject(error);
      }
    });
  }

  private setupSubscriptions(): void {
    if (!this.client) return;

    // Subscribe to all device topics with wildcards
    const topics = [
      'smartlunchbox/+/temperature/current',
      'smartlunchbox/+/status/online',
      'smartlunchbox/+/alerts',
      'smartlunchbox/+/firmware/version'
    ];

    topics.forEach(topic => {
      this.client!.subscribe(topic, { qos: 1 }, (err) => {
        if (err) {
          logger.error(`Failed to subscribe to ${topic}:`, err);
        } else {
          logger.info(`Subscribed to ${topic}`);
        }
      });
    });
  }

  private handleMessage(topic: string, message: Buffer): void {
    try {
      const payloadStr = message.toString();
      let payload: any;

      try {
        payload = JSON.parse(payloadStr);
      } catch {
        payload = payloadStr;
      }

      logger.debug(`MQTT message received on ${topic}:`, payload);

      // Extract device ID from topic
      const deviceId = topic.split('/')[1];

      // Handle different message types
      if (topic.includes('/temperature/current')) {
        this.handleTemperatureData(deviceId, payload);
      } else if (topic.includes('/status/online')) {
        this.handleDeviceStatus(deviceId, payload);
      } else if (topic.includes('/alerts')) {
        this.handleAlert(deviceId, payload);
      } else if (topic.includes('/firmware/version')) {
        this.handleFirmwareVersion(deviceId, payload);
      }

    } catch (error) {
      logger.error('Error handling MQTT message:', error);
    }
  }

  private handleTemperatureData(deviceId: string, payload: any): void {
    // Store temperature data in database
    // This would typically save to a TemperatureData model
    logger.debug(`Temperature data from ${deviceId}:`, payload);
    // TODO: Implement database storage
  }

  private handleDeviceStatus(deviceId: string, status: any): void {
    // Update device online status
    logger.info(`Device ${deviceId} status: ${status}`);
    // TODO: Update device status in database
  }

  private handleAlert(deviceId: string, alert: any): void {
    // Process and forward alerts
    logger.warn(`Alert from ${deviceId}:`, alert);
    // TODO: Send push notifications, store in database
  }

  private handleFirmwareVersion(deviceId: string, version: any): void {
    // Update device firmware version
    logger.info(`Device ${deviceId} firmware: ${version}`);
    // TODO: Update device record in database
  }

  async publish(topic: string, message: string | object, qos: 0 | 1 | 2 = 1): Promise<void> {
    if (!this.client || !this.client.connected) {
      throw new Error('MQTT client not connected');
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message);

    return new Promise((resolve, reject) => {
      this.client!.publish(topic, payload, { qos }, (err) => {
        if (err) {
          logger.error(`Failed to publish to ${topic}:`, err);
          reject(err);
        } else {
          logger.debug(`Published to ${topic}`);
          resolve();
        }
      });
    });
  }

  async sendHeatingCommand(deviceId: string, action: 'start' | 'stop', targetTemp?: number, maxDuration?: number): Promise<void> {
    const topic = `smartlunchbox/${deviceId}/control/heat`;
    const payload = {
      action,
      targetTemp,
      maxDuration,
      timestamp: Date.now()
    };
    await this.publish(topic, payload, 1);
  }

  async sendCoolingCommand(deviceId: string, action: 'start' | 'stop', targetTemp?: number, maxDuration?: number): Promise<void> {
    const topic = `smartlunchbox/${deviceId}/control/cool`;
    const payload = {
      action,
      targetTemp,
      maxDuration,
      timestamp: Date.now()
    };
    await this.publish(topic, payload, 1);
  }

  async setTargetTemperature(deviceId: string, temperature: number): Promise<void> {
    const topic = `smartlunchbox/${deviceId}/temperature/target`;
    const payload = {
      temperature,
      unit: 'celsius',
      timestamp: Date.now()
    };
    await this.publish(topic, payload, 1);
  }

  async sendSchedule(deviceId: string, schedule: any): Promise<void> {
    const topic = `smartlunchbox/${deviceId}/timer/schedule`;
    await this.publish(topic, schedule, 1);
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      return new Promise((resolve) => {
        this.client!.end(false, {}, () => {
          logger.info('MQTT client disconnected');
          resolve();
        });
      });
    }
  }
}

export const mqttService = new MqttService();
