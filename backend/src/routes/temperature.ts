import { Router } from 'express';
import TemperatureController from '../controllers/TemperatureController';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  validate,
  deviceIdValidation,
  temperatureQueryValidation
} from '../middleware/validation';

const router = Router();

// All temperature routes require authentication
router.use(authenticateToken);

// Get current temperature for a device
router.get(
  '/:deviceId/current',
  validate(deviceIdValidation),
  asyncHandler(TemperatureController.getCurrentTemperature.bind(TemperatureController))
);

// Get temperature history with pagination and date filters
router.get(
  '/:deviceId/history',
  validate([...deviceIdValidation, ...temperatureQueryValidation]),
  asyncHandler(TemperatureController.getTemperatureHistory.bind(TemperatureController))
);

// Get temperature statistics
router.get(
  '/:deviceId/stats',
  validate(deviceIdValidation),
  asyncHandler(TemperatureController.getTemperatureStats.bind(TemperatureController))
);

// Record new temperature reading (typically called by device/MQTT)
router.post(
  '/:deviceId/record',
  validate(deviceIdValidation),
  asyncHandler(TemperatureController.recordTemperature.bind(TemperatureController))
);

// Delete old temperature readings
router.delete(
  '/:deviceId/old-readings',
  validate(deviceIdValidation),
  asyncHandler(TemperatureController.deleteOldReadings.bind(TemperatureController))
);

export default router;
