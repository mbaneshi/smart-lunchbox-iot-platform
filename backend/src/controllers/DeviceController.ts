import { Response } from 'express';
import Device, { DeviceStatus } from '../models/Device';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { mqttService } from '../services/mqtt.service';
import logger from '../utils/logger';

export class DeviceController {
  async registerDevice(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { name, firmwareVersion, wifiSSID } = req.body;

      const device = await Device.create({
        userId: req.user.id,
        name,
        firmwareVersion: firmwareVersion || '1.0.0',
        wifiSSID,
        status: DeviceStatus.OFFLINE,
        lastOnline: new Date(),
        registeredAt: new Date()
      });

      logger.info(`Device registered: ${device.id} by user ${req.user.email}`);

      res.status(201).json({
        message: 'Device registered successfully',
        device: {
          id: device.id,
          name: device.name,
          firmwareVersion: device.firmwareVersion,
          status: device.status,
          settings: device.settings,
          registeredAt: device.registeredAt
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Device registration error:', error);
      throw new AppError('Failed to register device', 500);
    }
  }

  async getDevices(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const devices = await Device.findAll({
        where: { userId: req.user.id },
        order: [['lastOnline', 'DESC']]
      });

      res.json({
        devices: devices.map(device => ({
          id: device.id,
          name: device.name,
          firmwareVersion: device.firmwareVersion,
          status: device.status,
          lastOnline: device.lastOnline,
          registeredAt: device.registeredAt,
          wifiSSID: device.wifiSSID,
          settings: device.settings
        })),
        count: devices.length
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get devices error:', error);
      throw new AppError('Failed to get devices', 500);
    }
  }

  async getDevice(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { deviceId } = req.params;

      const device = await Device.findOne({
        where: {
          id: deviceId,
          userId: req.user.id
        }
      });

      if (!device) {
        throw new AppError('Device not found', 404);
      }

      res.json({
        id: device.id,
        name: device.name,
        firmwareVersion: device.firmwareVersion,
        status: device.status,
        lastOnline: device.lastOnline,
        registeredAt: device.registeredAt,
        wifiSSID: device.wifiSSID,
        settings: device.settings
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get device error:', error);
      throw new AppError('Failed to get device', 500);
    }
  }

  async updateDevice(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { deviceId } = req.params;
      const { name, settings } = req.body;

      const device = await Device.findOne({
        where: {
          id: deviceId,
          userId: req.user.id
        }
      });

      if (!device) {
        throw new AppError('Device not found', 404);
      }

      if (name) device.name = name;
      if (settings) {
        device.settings = {
          ...device.settings,
          ...settings
        };
      }

      await device.save();

      logger.info(`Device updated: ${device.id}`);

      res.json({
        message: 'Device updated successfully',
        device: {
          id: device.id,
          name: device.name,
          settings: device.settings
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update device error:', error);
      throw new AppError('Failed to update device', 500);
    }
  }

  async deleteDevice(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { deviceId } = req.params;

      const device = await Device.findOne({
        where: {
          id: deviceId,
          userId: req.user.id
        }
      });

      if (!device) {
        throw new AppError('Device not found', 404);
      }

      await device.destroy();

      logger.info(`Device deleted: ${deviceId}`);

      res.json({
        message: 'Device deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Delete device error:', error);
      throw new AppError('Failed to delete device', 500);
    }
  }

  async sendCommand(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { deviceId } = req.params;
      const { command, targetTemp, maxDuration } = req.body;

      const device = await Device.findOne({
        where: {
          id: deviceId,
          userId: req.user.id
        }
      });

      if (!device) {
        throw new AppError('Device not found', 404);
      }

      if (device.status === DeviceStatus.OFFLINE) {
        throw new AppError('Device is offline', 503);
      }

      switch (command) {
        case 'heat_start':
          await mqttService.sendHeatingCommand(deviceId, 'start', targetTemp, maxDuration);
          break;
        case 'heat_stop':
          await mqttService.sendHeatingCommand(deviceId, 'stop');
          break;
        case 'cool_start':
          await mqttService.sendCoolingCommand(deviceId, 'start', targetTemp, maxDuration);
          break;
        case 'cool_stop':
          await mqttService.sendCoolingCommand(deviceId, 'stop');
          break;
        case 'set_target_temp':
          if (!targetTemp) {
            throw new AppError('Target temperature is required', 400);
          }
          await mqttService.setTargetTemperature(deviceId, targetTemp);
          break;
        case 'power_off':
          await mqttService.sendHeatingCommand(deviceId, 'stop');
          await mqttService.sendCoolingCommand(deviceId, 'stop');
          break;
        default:
          throw new AppError('Invalid command', 400);
      }

      logger.info(`Command sent to device ${deviceId}: ${command}`);

      res.json({
        message: 'Command sent successfully',
        command,
        deviceId
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Send command error:', error);
      throw new AppError('Failed to send command', 500);
    }
  }

  async updateStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { deviceId } = req.params;
      const { status } = req.body;

      const device = await Device.findByPk(deviceId);
      if (!device) {
        throw new AppError('Device not found', 404);
      }

      device.status = status;
      device.lastOnline = new Date();
      await device.save();

      logger.info(`Device status updated: ${deviceId} -> ${status}`);

      res.json({
        message: 'Device status updated',
        device: {
          id: device.id,
          status: device.status,
          lastOnline: device.lastOnline
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update status error:', error);
      throw new AppError('Failed to update status', 500);
    }
  }

  async getDeviceStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { deviceId } = req.params;

      const device = await Device.findOne({
        where: {
          id: deviceId,
          userId: req.user.id
        }
      });

      if (!device) {
        throw new AppError('Device not found', 404);
      }

      const isOnline = device.status === DeviceStatus.ONLINE;
      const offlineThreshold = 5 * 60 * 1000; // 5 minutes
      const timeSinceLastOnline = Date.now() - device.lastOnline.getTime();

      res.json({
        deviceId: device.id,
        status: device.status,
        isOnline: isOnline && timeSinceLastOnline < offlineThreshold,
        lastOnline: device.lastOnline,
        firmwareVersion: device.firmwareVersion
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get device status error:', error);
      throw new AppError('Failed to get device status', 500);
    }
  }
}

export default new DeviceController();
