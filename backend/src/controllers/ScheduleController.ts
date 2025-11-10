import { Response } from 'express';
import Schedule from '../models/Schedule';
import Device from '../models/Device';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { mqttService } from '../services/mqtt.service';
import logger from '../utils/logger';

export class ScheduleController {
  async createSchedule(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { deviceId } = req.params;
      const { name, mode, targetTemp, startTime, duration, recurring, enabled, notifications } = req.body;

      const device = await Device.findOne({
        where: {
          id: deviceId,
          userId: req.user.id
        }
      });

      if (!device) {
        throw new AppError('Device not found', 404);
      }

      const schedule = await Schedule.create({
        deviceId,
        name,
        mode,
        targetTemp,
        startTime: new Date(startTime),
        duration,
        recurring: recurring || {
          enabled: false,
          pattern: 'once',
          daysOfWeek: []
        },
        enabled: enabled !== undefined ? enabled : true,
        notifications: notifications !== undefined ? notifications : true
      });

      // Send schedule to device via MQTT
      if (schedule.enabled) {
        await mqttService.sendSchedule(deviceId, {
          id: schedule.id,
          name: schedule.name,
          mode: schedule.mode,
          targetTemp: schedule.targetTemp,
          startTime: schedule.startTime,
          duration: schedule.duration,
          recurring: schedule.recurring
        });
      }

      logger.info(`Schedule created: ${schedule.id} for device ${deviceId}`);

      res.status(201).json({
        message: 'Schedule created successfully',
        schedule: {
          id: schedule.id,
          name: schedule.name,
          mode: schedule.mode,
          targetTemp: schedule.targetTemp,
          startTime: schedule.startTime,
          duration: schedule.duration,
          recurring: schedule.recurring,
          enabled: schedule.enabled,
          notifications: schedule.notifications
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Create schedule error:', error);
      throw new AppError('Failed to create schedule', 500);
    }
  }

  async getSchedules(req: AuthRequest, res: Response): Promise<void> {
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

      const schedules = await Schedule.findAll({
        where: { deviceId },
        order: [['startTime', 'ASC']]
      });

      res.json({
        deviceId,
        schedules: schedules.map(schedule => ({
          id: schedule.id,
          name: schedule.name,
          mode: schedule.mode,
          targetTemp: schedule.targetTemp,
          startTime: schedule.startTime,
          duration: schedule.duration,
          recurring: schedule.recurring,
          enabled: schedule.enabled,
          notifications: schedule.notifications,
          createdAt: schedule.createdAt
        })),
        count: schedules.length
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get schedules error:', error);
      throw new AppError('Failed to get schedules', 500);
    }
  }

  async getSchedule(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { deviceId, scheduleId } = req.params;

      const device = await Device.findOne({
        where: {
          id: deviceId,
          userId: req.user.id
        }
      });

      if (!device) {
        throw new AppError('Device not found', 404);
      }

      const schedule = await Schedule.findOne({
        where: {
          id: scheduleId,
          deviceId
        }
      });

      if (!schedule) {
        throw new AppError('Schedule not found', 404);
      }

      res.json({
        id: schedule.id,
        name: schedule.name,
        mode: schedule.mode,
        targetTemp: schedule.targetTemp,
        startTime: schedule.startTime,
        duration: schedule.duration,
        recurring: schedule.recurring,
        enabled: schedule.enabled,
        notifications: schedule.notifications,
        createdAt: schedule.createdAt,
        updatedAt: schedule.updatedAt
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get schedule error:', error);
      throw new AppError('Failed to get schedule', 500);
    }
  }

  async updateSchedule(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { deviceId, scheduleId } = req.params;
      const updates = req.body;

      const device = await Device.findOne({
        where: {
          id: deviceId,
          userId: req.user.id
        }
      });

      if (!device) {
        throw new AppError('Device not found', 404);
      }

      const schedule = await Schedule.findOne({
        where: {
          id: scheduleId,
          deviceId
        }
      });

      if (!schedule) {
        throw new AppError('Schedule not found', 404);
      }

      if (updates.name !== undefined) schedule.name = updates.name;
      if (updates.mode !== undefined) schedule.mode = updates.mode;
      if (updates.targetTemp !== undefined) schedule.targetTemp = updates.targetTemp;
      if (updates.startTime !== undefined) schedule.startTime = new Date(updates.startTime);
      if (updates.duration !== undefined) schedule.duration = updates.duration;
      if (updates.recurring !== undefined) {
        schedule.recurring = {
          ...schedule.recurring,
          ...updates.recurring
        };
      }
      if (updates.enabled !== undefined) schedule.enabled = updates.enabled;
      if (updates.notifications !== undefined) schedule.notifications = updates.notifications;

      await schedule.save();

      // Update schedule on device via MQTT
      if (schedule.enabled) {
        await mqttService.sendSchedule(deviceId, {
          id: schedule.id,
          name: schedule.name,
          mode: schedule.mode,
          targetTemp: schedule.targetTemp,
          startTime: schedule.startTime,
          duration: schedule.duration,
          recurring: schedule.recurring
        });
      }

      logger.info(`Schedule updated: ${scheduleId}`);

      res.json({
        message: 'Schedule updated successfully',
        schedule: {
          id: schedule.id,
          name: schedule.name,
          mode: schedule.mode,
          targetTemp: schedule.targetTemp,
          startTime: schedule.startTime,
          duration: schedule.duration,
          recurring: schedule.recurring,
          enabled: schedule.enabled,
          notifications: schedule.notifications
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update schedule error:', error);
      throw new AppError('Failed to update schedule', 500);
    }
  }

  async deleteSchedule(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { deviceId, scheduleId } = req.params;

      const device = await Device.findOne({
        where: {
          id: deviceId,
          userId: req.user.id
        }
      });

      if (!device) {
        throw new AppError('Device not found', 404);
      }

      const schedule = await Schedule.findOne({
        where: {
          id: scheduleId,
          deviceId
        }
      });

      if (!schedule) {
        throw new AppError('Schedule not found', 404);
      }

      await schedule.destroy();

      logger.info(`Schedule deleted: ${scheduleId}`);

      res.json({
        message: 'Schedule deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Delete schedule error:', error);
      throw new AppError('Failed to delete schedule', 500);
    }
  }

  async toggleSchedule(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { deviceId, scheduleId } = req.params;

      const device = await Device.findOne({
        where: {
          id: deviceId,
          userId: req.user.id
        }
      });

      if (!device) {
        throw new AppError('Device not found', 404);
      }

      const schedule = await Schedule.findOne({
        where: {
          id: scheduleId,
          deviceId
        }
      });

      if (!schedule) {
        throw new AppError('Schedule not found', 404);
      }

      schedule.enabled = !schedule.enabled;
      await schedule.save();

      // Update schedule on device via MQTT
      if (schedule.enabled) {
        await mqttService.sendSchedule(deviceId, {
          id: schedule.id,
          name: schedule.name,
          mode: schedule.mode,
          targetTemp: schedule.targetTemp,
          startTime: schedule.startTime,
          duration: schedule.duration,
          recurring: schedule.recurring
        });
      }

      logger.info(`Schedule toggled: ${scheduleId} -> ${schedule.enabled}`);

      res.json({
        message: `Schedule ${schedule.enabled ? 'enabled' : 'disabled'} successfully`,
        schedule: {
          id: schedule.id,
          enabled: schedule.enabled
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Toggle schedule error:', error);
      throw new AppError('Failed to toggle schedule', 500);
    }
  }
}

export default new ScheduleController();
