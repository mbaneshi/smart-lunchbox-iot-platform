import { Response } from 'express';
import { Op } from 'sequelize';
import TemperatureReading, { OperationMode } from '../models/TemperatureReading';
import Device from '../models/Device';
import Alert, { AlertType, AlertSeverity } from '../models/Alert';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class TemperatureController {
  async getCurrentTemperature(req: AuthRequest, res: Response): Promise<void> {
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

      const latestReading = await TemperatureReading.findOne({
        where: { deviceId },
        order: [['timestamp', 'DESC']]
      });

      if (!latestReading) {
        throw new AppError('No temperature readings available', 404);
      }

      res.json({
        deviceId,
        reading: {
          foodTemp: latestReading.foodTemp,
          ambientTemp: latestReading.ambientTemp,
          humidity: latestReading.humidity,
          timestamp: latestReading.timestamp,
          unit: latestReading.unit,
          mode: latestReading.mode,
          targetTemp: latestReading.targetTemp
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get current temperature error:', error);
      throw new AppError('Failed to get current temperature', 500);
    }
  }

  async getTemperatureHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { deviceId } = req.params;
      const { startDate, endDate, limit = '100', offset = '0' } = req.query;

      const device = await Device.findOne({
        where: {
          id: deviceId,
          userId: req.user.id
        }
      });

      if (!device) {
        throw new AppError('Device not found', 404);
      }

      const whereClause: any = { deviceId };

      if (startDate || endDate) {
        whereClause.timestamp = {};
        if (startDate) whereClause.timestamp[Op.gte] = new Date(startDate as string);
        if (endDate) whereClause.timestamp[Op.lte] = new Date(endDate as string);
      }

      const readings = await TemperatureReading.findAll({
        where: whereClause,
        order: [['timestamp', 'DESC']],
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      });

      const totalCount = await TemperatureReading.count({ where: whereClause });

      res.json({
        deviceId,
        readings: readings.map(reading => ({
          id: reading.id,
          foodTemp: reading.foodTemp,
          ambientTemp: reading.ambientTemp,
          humidity: reading.humidity,
          timestamp: reading.timestamp,
          unit: reading.unit,
          mode: reading.mode,
          targetTemp: reading.targetTemp
        })),
        pagination: {
          total: totalCount,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: parseInt(offset as string) + readings.length < totalCount
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get temperature history error:', error);
      throw new AppError('Failed to get temperature history', 500);
    }
  }

  async recordTemperature(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { deviceId } = req.params;
      const { foodTemp, ambientTemp, humidity, unit, mode, targetTemp } = req.body;

      const device = await Device.findByPk(deviceId);
      if (!device) {
        throw new AppError('Device not found', 404);
      }

      const reading = await TemperatureReading.create({
        deviceId,
        foodTemp,
        ambientTemp,
        humidity: humidity || 0,
        timestamp: new Date(),
        unit: unit || 'celsius',
        mode: mode || OperationMode.IDLE,
        targetTemp
      });

      // Check for temperature alerts
      await this.checkTemperatureAlerts(device, reading);

      logger.debug(`Temperature recorded for device ${deviceId}: ${foodTemp}°${unit}`);

      res.status(201).json({
        message: 'Temperature recorded successfully',
        reading: {
          id: reading.id,
          foodTemp: reading.foodTemp,
          ambientTemp: reading.ambientTemp,
          humidity: reading.humidity,
          timestamp: reading.timestamp,
          mode: reading.mode
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Record temperature error:', error);
      throw new AppError('Failed to record temperature', 500);
    }
  }

  async getTemperatureStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { deviceId } = req.params;
      const { hours = '24' } = req.query;

      const device = await Device.findOne({
        where: {
          id: deviceId,
          userId: req.user.id
        }
      });

      if (!device) {
        throw new AppError('Device not found', 404);
      }

      const hoursAgo = new Date(Date.now() - parseInt(hours as string) * 60 * 60 * 1000);

      const readings = await TemperatureReading.findAll({
        where: {
          deviceId,
          timestamp: {
            [Op.gte]: hoursAgo
          }
        },
        order: [['timestamp', 'ASC']]
      });

      if (readings.length === 0) {
        res.json({
          deviceId,
          stats: null,
          message: 'No data available for the specified time range'
        });
        return;
      }

      const temps = readings.map(r => r.foodTemp);
      const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
      const minTemp = Math.min(...temps);
      const maxTemp = Math.max(...temps);

      const modeDistribution = readings.reduce((acc, r) => {
        acc[r.mode] = (acc[r.mode] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        deviceId,
        timeRange: `${hours} hours`,
        stats: {
          avgTemp: parseFloat(avgTemp.toFixed(2)),
          minTemp,
          maxTemp,
          readingsCount: readings.length,
          modeDistribution,
          latestReading: readings[readings.length - 1]
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get temperature stats error:', error);
      throw new AppError('Failed to get temperature stats', 500);
    }
  }

  async deleteOldReadings(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { deviceId } = req.params;
      const { days = '30' } = req.query;

      const device = await Device.findOne({
        where: {
          id: deviceId,
          userId: req.user.id
        }
      });

      if (!device) {
        throw new AppError('Device not found', 404);
      }

      const daysAgo = new Date(Date.now() - parseInt(days as string) * 24 * 60 * 60 * 1000);

      const deletedCount = await TemperatureReading.destroy({
        where: {
          deviceId,
          timestamp: {
            [Op.lt]: daysAgo
          }
        }
      });

      logger.info(`Deleted ${deletedCount} old temperature readings for device ${deviceId}`);

      res.json({
        message: 'Old readings deleted successfully',
        deletedCount,
        olderThan: `${days} days`
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Delete old readings error:', error);
      throw new AppError('Failed to delete old readings', 500);
    }
  }

  private async checkTemperatureAlerts(device: Device, reading: TemperatureReading): Promise<void> {
    try {
      const { maxTemp, emergencyTemp } = device.settings.safetyLimits;

      if (reading.foodTemp >= emergencyTemp) {
        await Alert.create({
          deviceId: device.id,
          type: AlertType.TEMP_TOO_HIGH,
          message: `Emergency: Temperature reached ${reading.foodTemp}°C (Emergency limit: ${emergencyTemp}°C)`,
          severity: AlertSeverity.CRITICAL,
          timestamp: new Date(),
          acknowledged: false,
          metadata: { temperature: reading.foodTemp, limit: emergencyTemp }
        });
      } else if (reading.foodTemp >= maxTemp) {
        await Alert.create({
          deviceId: device.id,
          type: AlertType.TEMP_TOO_HIGH,
          message: `Warning: Temperature reached ${reading.foodTemp}°C (Max limit: ${maxTemp}°C)`,
          severity: AlertSeverity.WARNING,
          timestamp: new Date(),
          acknowledged: false,
          metadata: { temperature: reading.foodTemp, limit: maxTemp }
        });
      }

      if (reading.foodTemp <= 0 && reading.mode === OperationMode.COOLING) {
        await Alert.create({
          deviceId: device.id,
          type: AlertType.TEMP_TOO_LOW,
          message: `Warning: Temperature dropped to ${reading.foodTemp}°C`,
          severity: AlertSeverity.WARNING,
          timestamp: new Date(),
          acknowledged: false,
          metadata: { temperature: reading.foodTemp }
        });
      }
    } catch (error) {
      logger.error('Error checking temperature alerts:', error);
    }
  }
}

export default new TemperatureController();
