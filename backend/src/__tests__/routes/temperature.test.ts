import request from 'supertest';
import app from '../../server';
import User from '../../models/User';
import Device, { DeviceStatus } from '../../models/Device';
import TemperatureReading, { OperationMode } from '../../models/TemperatureReading';
import bcrypt from 'bcrypt';

describe('Temperature Routes', () => {
  let authToken: string;
  let userId: string;
  let deviceId: string;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('Password123', 10);
    const user = await User.create({
      email: 'test@example.com',
      passwordHash,
      name: 'Test User'
    });
    userId = user.id;

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ email: 'test@example.com', password: 'Password123' });

    authToken = loginResponse.body.token;

    const device = await Device.create({
      userId,
      name: 'Test Device',
      firmwareVersion: '1.0.0',
      wifiSSID: 'WiFi',
      status: DeviceStatus.ONLINE
    });
    deviceId = device.id;
  });

  describe('GET /api/temperature/:deviceId/current', () => {
    beforeEach(async () => {
      await TemperatureReading.create({
        deviceId,
        foodTemp: 25.5,
        ambientTemp: 22.0,
        humidity: 45.0,
        timestamp: new Date(),
        unit: 'celsius',
        mode: OperationMode.IDLE
      });
    });

    it('should get current temperature reading', async () => {
      const response = await request(app)
        .get(`/api/temperature/${deviceId}/current`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('deviceId', deviceId);
      expect(response.body.reading).toHaveProperty('foodTemp', 25.5);
      expect(response.body.reading).toHaveProperty('ambientTemp', 22.0);
      expect(response.body.reading).toHaveProperty('humidity', 45.0);
    });

    it('should return 404 when no readings exist', async () => {
      await TemperatureReading.destroy({ where: { deviceId } });

      const response = await request(app)
        .get(`/api/temperature/${deviceId}/current`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'No temperature readings available');
    });
  });

  describe('GET /api/temperature/:deviceId/history', () => {
    beforeEach(async () => {
      const now = Date.now();

      for (let i = 0; i < 10; i++) {
        await TemperatureReading.create({
          deviceId,
          foodTemp: 20 + i,
          ambientTemp: 20,
          humidity: 45,
          timestamp: new Date(now - i * 60000),
          unit: 'celsius',
          mode: OperationMode.HEATING
        });
      }
    });

    it('should get temperature history with default pagination', async () => {
      const response = await request(app)
        .get(`/api/temperature/${deviceId}/history`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('deviceId', deviceId);
      expect(response.body.readings).toHaveLength(10);
      expect(response.body.pagination).toHaveProperty('total', 10);
      expect(response.body.pagination).toHaveProperty('hasMore', false);
    });

    it('should paginate temperature history', async () => {
      const response = await request(app)
        .get(`/api/temperature/${deviceId}/history?limit=5&offset=0`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.readings).toHaveLength(5);
      expect(response.body.pagination).toHaveProperty('hasMore', true);
    });

    it('should filter temperature history by date range', async () => {
      const startDate = new Date(Date.now() - 5 * 60000).toISOString();
      const endDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/temperature/${deviceId}/history`)
        .query({ startDate, endDate })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.readings.length).toBeGreaterThan(0);
      expect(response.body.readings.length).toBeLessThanOrEqual(6);
    });
  });

  describe('POST /api/temperature/:deviceId/record', () => {
    it('should record new temperature reading', async () => {
      const reading = {
        foodTemp: 35.5,
        ambientTemp: 25.0,
        humidity: 50.0,
        unit: 'celsius',
        mode: 'heating',
        targetTemp: 40.0
      };

      const response = await request(app)
        .post(`/api/temperature/${deviceId}/record`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reading)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Temperature recorded successfully');
      expect(response.body.reading).toHaveProperty('foodTemp', 35.5);
      expect(response.body.reading).toHaveProperty('mode', 'heating');
    });

    it('should create alert for high temperature', async () => {
      const reading = {
        foodTemp: 75.0,
        ambientTemp: 25.0,
        humidity: 50.0,
        unit: 'celsius',
        mode: 'heating'
      };

      const response = await request(app)
        .post(`/api/temperature/${deviceId}/record`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reading)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Temperature recorded successfully');
    });

    it('should reject invalid temperature values', async () => {
      const reading = {
        foodTemp: 'invalid',
        ambientTemp: 25.0,
        humidity: 50.0
      };

      const response = await request(app)
        .post(`/api/temperature/${deviceId}/record`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reading)
        .expect(400);
    });
  });

  describe('GET /api/temperature/:deviceId/stats', () => {
    beforeEach(async () => {
      const temps = [20, 25, 30, 35, 40];

      for (const temp of temps) {
        await TemperatureReading.create({
          deviceId,
          foodTemp: temp,
          ambientTemp: 22,
          humidity: 45,
          timestamp: new Date(),
          unit: 'celsius',
          mode: OperationMode.HEATING
        });
      }
    });

    it('should get temperature statistics', async () => {
      const response = await request(app)
        .get(`/api/temperature/${deviceId}/stats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('deviceId', deviceId);
      expect(response.body.stats).toHaveProperty('avgTemp', 30);
      expect(response.body.stats).toHaveProperty('minTemp', 20);
      expect(response.body.stats).toHaveProperty('maxTemp', 40);
      expect(response.body.stats).toHaveProperty('readingsCount', 5);
    });

    it('should get statistics for custom time range', async () => {
      const response = await request(app)
        .get(`/api/temperature/${deviceId}/stats?hours=12`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('timeRange', '12 hours');
      expect(response.body.stats).toBeDefined();
    });

    it('should handle no data gracefully', async () => {
      await TemperatureReading.destroy({ where: { deviceId } });

      const response = await request(app)
        .get(`/api/temperature/${deviceId}/stats?hours=1`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.stats).toBeNull();
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /api/temperature/:deviceId/old-readings', () => {
    beforeEach(async () => {
      const oldDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);
      const recentDate = new Date();

      await TemperatureReading.create({
        deviceId,
        foodTemp: 20,
        ambientTemp: 20,
        humidity: 45,
        timestamp: oldDate,
        unit: 'celsius',
        mode: OperationMode.IDLE
      });

      await TemperatureReading.create({
        deviceId,
        foodTemp: 25,
        ambientTemp: 22,
        humidity: 45,
        timestamp: recentDate,
        unit: 'celsius',
        mode: OperationMode.IDLE
      });
    });

    it('should delete old temperature readings', async () => {
      const response = await request(app)
        .delete(`/api/temperature/${deviceId}/old-readings?days=30`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Old readings deleted successfully');
      expect(response.body).toHaveProperty('deletedCount', 1);

      const remainingReadings = await TemperatureReading.count({ where: { deviceId } });
      expect(remainingReadings).toBe(1);
    });
  });
});
