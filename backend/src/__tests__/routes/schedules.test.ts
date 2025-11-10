import request from 'supertest';
import app from '../../server';
import User from '../../models/User';
import Device, { DeviceStatus } from '../../models/Device';
import Schedule, { RecurringType } from '../../models/Schedule';
import { OperationMode } from '../../models/TemperatureReading';
import bcrypt from 'bcrypt';

describe('Schedule Routes', () => {
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

  describe('POST /api/schedules/:deviceId', () => {
    it('should create a new schedule successfully', async () => {
      const scheduleData = {
        name: 'Lunch Heating',
        mode: 'heating',
        targetTemp: 45,
        startTime: new Date(Date.now() + 3600000).toISOString(),
        duration: 1800,
        recurring: {
          enabled: true,
          pattern: 'daily',
          daysOfWeek: []
        },
        enabled: true,
        notifications: true
      };

      const response = await request(app)
        .post(`/api/schedules/${deviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(scheduleData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Schedule created successfully');
      expect(response.body.schedule).toHaveProperty('name', 'Lunch Heating');
      expect(response.body.schedule).toHaveProperty('mode', 'heating');
      expect(response.body.schedule).toHaveProperty('targetTemp', 45);
    });

    it('should reject schedule with invalid mode', async () => {
      const scheduleData = {
        name: 'Test Schedule',
        mode: 'invalid_mode',
        targetTemp: 45,
        startTime: new Date().toISOString()
      };

      const response = await request(app)
        .post(`/api/schedules/${deviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(scheduleData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should reject schedule with invalid temperature', async () => {
      const scheduleData = {
        name: 'Test Schedule',
        mode: 'heating',
        targetTemp: 150,
        startTime: new Date().toISOString()
      };

      const response = await request(app)
        .post(`/api/schedules/${deviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(scheduleData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });

  describe('GET /api/schedules/:deviceId', () => {
    beforeEach(async () => {
      await Schedule.create({
        deviceId,
        name: 'Morning Heat',
        mode: OperationMode.HEATING,
        targetTemp: 40,
        startTime: new Date(),
        duration: 1800,
        recurring: {
          enabled: true,
          pattern: RecurringType.DAILY,
          daysOfWeek: []
        },
        enabled: true,
        notifications: true
      });

      await Schedule.create({
        deviceId,
        name: 'Evening Cool',
        mode: OperationMode.COOLING,
        targetTemp: 10,
        startTime: new Date(),
        duration: 3600,
        recurring: {
          enabled: false,
          pattern: RecurringType.ONCE,
          daysOfWeek: []
        },
        enabled: true,
        notifications: true
      });
    });

    it('should get all schedules for a device', async () => {
      const response = await request(app)
        .get(`/api/schedules/${deviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('deviceId', deviceId);
      expect(response.body.schedules).toHaveLength(2);
      expect(response.body).toHaveProperty('count', 2);
    });

    it('should return empty array for device with no schedules', async () => {
      await Schedule.destroy({ where: { deviceId } });

      const response = await request(app)
        .get(`/api/schedules/${deviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.schedules).toHaveLength(0);
      expect(response.body).toHaveProperty('count', 0);
    });
  });

  describe('GET /api/schedules/:deviceId/:scheduleId', () => {
    let scheduleId: string;

    beforeEach(async () => {
      const schedule = await Schedule.create({
        deviceId,
        name: 'Test Schedule',
        mode: OperationMode.HEATING,
        targetTemp: 45,
        startTime: new Date(),
        duration: 1800,
        recurring: {
          enabled: false,
          pattern: RecurringType.ONCE,
          daysOfWeek: []
        },
        enabled: true,
        notifications: true
      });
      scheduleId = schedule.id;
    });

    it('should get schedule by id', async () => {
      const response = await request(app)
        .get(`/api/schedules/${deviceId}/${scheduleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', scheduleId);
      expect(response.body).toHaveProperty('name', 'Test Schedule');
      expect(response.body).toHaveProperty('mode', 'heating');
    });

    it('should return 404 for non-existent schedule', async () => {
      const fakeId = '12345678-1234-1234-1234-123456789012';

      const response = await request(app)
        .get(`/api/schedules/${deviceId}/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Schedule not found');
    });
  });

  describe('PUT /api/schedules/:deviceId/:scheduleId', () => {
    let scheduleId: string;

    beforeEach(async () => {
      const schedule = await Schedule.create({
        deviceId,
        name: 'Original Schedule',
        mode: OperationMode.HEATING,
        targetTemp: 40,
        startTime: new Date(),
        duration: 1800,
        recurring: {
          enabled: false,
          pattern: RecurringType.ONCE,
          daysOfWeek: []
        },
        enabled: true,
        notifications: true
      });
      scheduleId = schedule.id;
    });

    it('should update schedule successfully', async () => {
      const updates = {
        name: 'Updated Schedule',
        targetTemp: 50,
        duration: 3600
      };

      const response = await request(app)
        .put(`/api/schedules/${deviceId}/${scheduleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Schedule updated successfully');
      expect(response.body.schedule).toHaveProperty('name', 'Updated Schedule');
      expect(response.body.schedule).toHaveProperty('targetTemp', 50);
    });

    it('should update recurring settings', async () => {
      const updates = {
        recurring: {
          enabled: true,
          pattern: 'weekdays',
          daysOfWeek: [1, 2, 3, 4, 5]
        }
      };

      const response = await request(app)
        .put(`/api/schedules/${deviceId}/${scheduleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.schedule.recurring).toHaveProperty('enabled', true);
      expect(response.body.schedule.recurring).toHaveProperty('pattern', 'weekdays');
    });
  });

  describe('DELETE /api/schedules/:deviceId/:scheduleId', () => {
    let scheduleId: string;

    beforeEach(async () => {
      const schedule = await Schedule.create({
        deviceId,
        name: 'Test Schedule',
        mode: OperationMode.HEATING,
        targetTemp: 45,
        startTime: new Date(),
        recurring: {
          enabled: false,
          pattern: RecurringType.ONCE,
          daysOfWeek: []
        },
        enabled: true,
        notifications: true
      });
      scheduleId = schedule.id;
    });

    it('should delete schedule successfully', async () => {
      const response = await request(app)
        .delete(`/api/schedules/${deviceId}/${scheduleId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Schedule deleted successfully');

      const schedule = await Schedule.findByPk(scheduleId);
      expect(schedule).toBeNull();
    });
  });

  describe('PATCH /api/schedules/:deviceId/:scheduleId/toggle', () => {
    let scheduleId: string;

    beforeEach(async () => {
      const schedule = await Schedule.create({
        deviceId,
        name: 'Test Schedule',
        mode: OperationMode.HEATING,
        targetTemp: 45,
        startTime: new Date(),
        recurring: {
          enabled: false,
          pattern: RecurringType.ONCE,
          daysOfWeek: []
        },
        enabled: true,
        notifications: true
      });
      scheduleId = schedule.id;
    });

    it('should toggle schedule enabled status', async () => {
      const response = await request(app)
        .patch(`/api/schedules/${deviceId}/${scheduleId}/toggle`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Schedule disabled successfully');
      expect(response.body.schedule).toHaveProperty('enabled', false);

      const toggledResponse = await request(app)
        .patch(`/api/schedules/${deviceId}/${scheduleId}/toggle`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(toggledResponse.body).toHaveProperty('message', 'Schedule enabled successfully');
      expect(toggledResponse.body.schedule).toHaveProperty('enabled', true);
    });
  });
});
