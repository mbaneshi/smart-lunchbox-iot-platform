import mqtt, { MqttClient as Client, IClientOptions } from 'mqtt';
import { EventEmitter } from 'events';

export interface MqttConfig {
  brokerUrl: string;
  username?: string;
  password?: string;
  clientId?: string;
  clean?: boolean;
  reconnectPeriod?: number;
  connectTimeout?: number;
}

export interface MqttMessage {
  topic: string;
  payload: string | object;
  qos?: 0 | 1 | 2;
  retain?: boolean;
}

class MqttClientService extends EventEmitter {
  private client: Client | null = null;
  private config: MqttConfig | null = null;
  private isConnected: boolean = false;
  private subscriptions: Set<string> = new Set();

  constructor() {
    super();
  }

  /**
   * Connect to MQTT broker
   */
  async connect(config: MqttConfig): Promise<void> {
    this.config = config;

    const options: IClientOptions = {
      clientId: config.clientId || `smartlunchbox_${Date.now()}`,
      username: config.username,
      password: config.password,
      clean: config.clean !== undefined ? config.clean : true,
      reconnectPeriod: config.reconnectPeriod || 5000,
      connectTimeout: config.connectTimeout || 30000,
      will: {
        topic: `smartlunchbox/${config.clientId}/status/online`,
        payload: Buffer.from('offline'),
        qos: 1,
        retain: true
      }
    };

    return new Promise((resolve, reject) => {
      try {
        this.client = mqtt.connect(config.brokerUrl, options);

        this.client.on('connect', () => {
          console.log('[MQTT] Connected to broker');
          this.isConnected = true;
          this.emit('connected');

          // Publish online status
          this.publish({
            topic: `smartlunchbox/${config.clientId}/status/online`,
            payload: 'online',
            qos: 1,
            retain: true
          });

          resolve();
        });

        this.client.on('error', (error) => {
          console.error('[MQTT] Connection error:', error);
          this.emit('error', error);
          reject(error);
        });

        this.client.on('offline', () => {
          console.log('[MQTT] Client offline');
          this.isConnected = false;
          this.emit('offline');
        });

        this.client.on('reconnect', () => {
          console.log('[MQTT] Reconnecting...');
          this.emit('reconnecting');
        });

        this.client.on('close', () => {
          console.log('[MQTT] Connection closed');
          this.isConnected = false;
          this.emit('closed');
        });

        this.client.on('message', (topic, message) => {
          this.handleMessage(topic, message);
        });

      } catch (error) {
        console.error('[MQTT] Failed to create client:', error);
        reject(error);
      }
    });
  }

  /**
   * Subscribe to a topic
   */
  async subscribe(topic: string, qos: 0 | 1 | 2 = 1): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('MQTT client not connected');
    }

    return new Promise((resolve, reject) => {
      this.client!.subscribe(topic, { qos }, (err) => {
        if (err) {
          console.error(`[MQTT] Failed to subscribe to ${topic}:`, err);
          reject(err);
        } else {
          console.log(`[MQTT] Subscribed to ${topic}`);
          this.subscriptions.add(topic);
          resolve();
        }
      });
    });
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribe(topic: string): Promise<void> {
    if (!this.client) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.client!.unsubscribe(topic, (err) => {
        if (err) {
          console.error(`[MQTT] Failed to unsubscribe from ${topic}:`, err);
          reject(err);
        } else {
          console.log(`[MQTT] Unsubscribed from ${topic}`);
          this.subscriptions.delete(topic);
          resolve();
        }
      });
    });
  }

  /**
   * Publish a message
   */
  async publish(message: MqttMessage): Promise<void> {
    if (!this.client || !this.isConnected) {
      throw new Error('MQTT client not connected');
    }

    const payload = typeof message.payload === 'string'
      ? message.payload
      : JSON.stringify(message.payload);

    return new Promise((resolve, reject) => {
      this.client!.publish(
        message.topic,
        payload,
        {
          qos: message.qos || 1,
          retain: message.retain || false
        },
        (err) => {
          if (err) {
            console.error(`[MQTT] Failed to publish to ${message.topic}:`, err);
            reject(err);
          } else {
            console.log(`[MQTT] Published to ${message.topic}`);
            resolve();
          }
        }
      );
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(topic: string, message: Buffer): void {
    try {
      const payloadStr = message.toString();
      let payload: any;

      try {
        payload = JSON.parse(payloadStr);
      } catch {
        payload = payloadStr;
      }

      console.log(`[MQTT] Message received on ${topic}:`, payload);
      this.emit('message', { topic, payload });
    } catch (error) {
      console.error('[MQTT] Error handling message:', error);
    }
  }

  /**
   * Disconnect from broker
   */
  disconnect(): void {
    if (this.client) {
      // Publish offline status before disconnecting
      if (this.isConnected && this.config?.clientId) {
        this.publish({
          topic: `smartlunchbox/${this.config.clientId}/status/online`,
          payload: 'offline',
          qos: 1,
          retain: true
        }).catch(console.error);
      }

      this.client.end(false, {}, () => {
        console.log('[MQTT] Disconnected');
      });

      this.client = null;
      this.isConnected = false;
      this.subscriptions.clear();
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get active subscriptions
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }
}

export default new MqttClientService();
