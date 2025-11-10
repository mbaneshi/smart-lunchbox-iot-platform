import request from 'supertest';
import app from '../../server';
import User from '../../models/User';
import Device, { DeviceStatus } from '../../models/Device';
import bcrypt from 'bcrypt';

describe('Device Routes', () => {
  let authToken: string;
  let userId: string;

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
  });

  describe('POST /api/devices', () => {
    it('should register a new device successfully', async () => {
      const deviceData = {
        name: 'My Lunchbox',
        firmwareVersion: '1.0.0',
        wifiSSID: 'HomeWiFi'
      };

      const response = await request(app)
        .post('/api/devices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(deviceData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Device registered successfully');
      expect(response.body.device).toHaveProperty('name', deviceData.name);
      expect(response.body.device).toHaveProperty('status', DeviceStatus.OFFLINE);
    });

    it('should reject device registration without authentication', async () => {
      const deviceData = {
        name: 'My Lunchbox'
      };

      const response = await request(app)
        .post('/api/devices')
        .send(deviceData)
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should reject device registration with invalid name', async () => {
      const deviceData = {
        name: ''
      };

      const response = await request(app)
        .post('/api/devices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(deviceData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });

  describe('GET /api/devices', () => {
    beforeEach(async () => {
      await Device.create({
        userId,
        name: 'Device 1',
        firmwareVersion: '1.0.0',
        wifiSSID: 'WiFi1',
        status: DeviceStatus.ONLINE
      });

      await Device.create({
        userId,
        name: 'Device 2',
        firmwareVersion: '1.0.0',
        wifiSSID: 'WiFi2',
        status: DeviceStatus.OFFLINE
      });
    });

    it('should get all user devices', async () => {
      const response = await request(app)
        .get('/api/devices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('devices');
      expect(response.body.devices).toHaveLength(2);
      expect(response.body).toHaveProperty('count', 2);
    });

    it('should only return devices for authenticated user', async () => {
      const otherUser = await User.create({
        email: 'other@example.com',
        passwordHash: await bcrypt.hash('Password123', 10),
        name: 'Other User'
      });

      await Device.create({
        userId: otherUser.id,
        name: 'Other Device',
        firmwareVersion: '1.0.0',
        wifiSSID: 'WiFi3',
        status: DeviceStatus.ONLINE
      });

      const response = await request(app)
        .get('/api/devices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.devices).toHaveLength(2);
    });
  });

  describe('GET /api/devices/:deviceId', () => {
    let deviceId: string;

    beforeEach(async () => {
      const device = await Device.create({
        userId,
        name: 'Test Device',
        firmwareVersion: '1.0.0',
        wifiSSID: 'WiFi',
        status: DeviceStatus.ONLINE
      });
      deviceId = device.id;
    });

    it('should get device by id', async () => {
      const response = await request(app)
        .get(`/api/devices/${deviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', deviceId);
      expect(response.body).toHaveProperty('name', 'Test Device');
    });

    it('should return 404 for non-existent device', async () => {
      const fakeId = '12345678-1234-1234-1234-123456789012';

      const response = await request(app)
        .get(`/api/devices/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Device not found');
    });

    it('should reject invalid device id format', async () => {
      const response = await request(app)
        .get('/api/devices/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });
  });

  describe('PUT /api/devices/:deviceId', () => {
    let deviceId: string;

    beforeEach(async () => {
      const device = await Device.create({
        userId,
        name: 'Test Device',
        firmwareVersion: '1.0.0',
        wifiSSID: 'WiFi',
        status: DeviceStatus.ONLINE
      });
      deviceId = device.id;
    });

    it('should update device successfully', async () => {
      const updates = {
        name: 'Updated Device',
        settings: {
          notificationsEnabled: false,
          autoUpdate: false
        }
      };

      const response = await request(app)
        .put(`/api/devices/${deviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Device updated successfully');
      expect(response.body.device).toHaveProperty('name', 'Updated Device');
    });
  });

  describe('DELETE /api/devices/:deviceId', () => {
    let deviceId: string;

    beforeEach(async () => {
      const device = await Device.create({
        userId,
        name: 'Test Device',
        firmwareVersion: '1.0.0',
        wifiSSID: 'WiFi',
        status: DeviceStatus.ONLINE
      });
      deviceId = device.id;
    });

    it('should delete device successfully', async () => {
      const response = await request(app)
        .delete(`/api/devices/${deviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Device deleted successfully');

      const device = await Device.findByPk(deviceId);
      expect(device).toBeNull();
    });
  });

  describe('POST /api/devices/:deviceId/command', () => {
    let deviceId: string;

    beforeEach(async () => {
      const device = await Device.create({
        userId,
        name: 'Test Device',
        firmwareVersion: '1.0.0',
        wifiSSID: 'WiFi',
        status: DeviceStatus.ONLINE
      });
      deviceId = device.id;
    });

    it('should send heating command successfully', async () => {
      const command = {
        command: 'heat_start',
        targetTemp: 45,
        maxDuration: 3600
      };

      const response = await request(app)
        .post(`/api/devices/${deviceId}/command`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(command)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Command sent successfully');
      expect(response.body).toHaveProperty('command', 'heat_start');
    });

    it('should send cooling command successfully', async () => {
      const command = {
        command: 'cool_start',
        targetTemp: 10,
        maxDuration: 3600
      };

      const response = await request(app)
        .post(`/api/devices/${deviceId}/command`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(command)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Command sent successfully');
    });

    it('should reject invalid command', async () => {
      const command = {
        command: 'invalid_command'
      };

      const response = await request(app)
        .post(`/api/devices/${deviceId}/command`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(command)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation Error');
    });

    it('should reject command to offline device', async () => {
      await Device.update(
        { status: DeviceStatus.OFFLINE },
        { where: { id: deviceId } }
      );

      const command = {
        command: 'heat_start',
        targetTemp: 45
      };

      const response = await request(app)
        .post(`/api/devices/${deviceId}/command`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(command)
        .expect(503);

      expect(response.body).toHaveProperty('error', 'Device is offline');
    });
  });

  describe('GET /api/devices/:deviceId/status', () => {
    let deviceId: string;

    beforeEach(async () => {
      const device = await Device.create({
        userId,
        name: 'Test Device',
        firmwareVersion: '1.0.0',
        wifiSSID: 'WiFi',
        status: DeviceStatus.ONLINE
      });
      deviceId = device.id;
    });

    it('should get device status', async () => {
      const response = await request(app)
        .get(`/api/devices/${deviceId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('deviceId', deviceId);
      expect(response.body).toHaveProperty('status', DeviceStatus.ONLINE);
      expect(response.body).toHaveProperty('isOnline');
      expect(response.body).toHaveProperty('lastOnline');
    });
  });
});
