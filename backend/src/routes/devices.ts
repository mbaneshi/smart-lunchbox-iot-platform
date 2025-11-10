import { Router } from 'express';
import DeviceController from '../controllers/DeviceController';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  validate,
  deviceRegistrationValidation,
  deviceUpdateValidation,
  deviceCommandValidation,
  deviceIdValidation
} from '../middleware/validation';

const router = Router();

// All device routes require authentication
router.use(authenticateToken);

// Device CRUD operations
router.post(
  '/',
  validate(deviceRegistrationValidation),
  asyncHandler(DeviceController.registerDevice.bind(DeviceController))
);

router.get(
  '/',
  asyncHandler(DeviceController.getDevices.bind(DeviceController))
);

router.get(
  '/:deviceId',
  validate(deviceIdValidation),
  asyncHandler(DeviceController.getDevice.bind(DeviceController))
);

router.put(
  '/:deviceId',
  validate([...deviceIdValidation, ...deviceUpdateValidation]),
  asyncHandler(DeviceController.updateDevice.bind(DeviceController))
);

router.delete(
  '/:deviceId',
  validate(deviceIdValidation),
  asyncHandler(DeviceController.deleteDevice.bind(DeviceController))
);

// Device control operations
router.post(
  '/:deviceId/command',
  validate([...deviceIdValidation, ...deviceCommandValidation]),
  asyncHandler(DeviceController.sendCommand.bind(DeviceController))
);

router.get(
  '/:deviceId/status',
  validate(deviceIdValidation),
  asyncHandler(DeviceController.getDeviceStatus.bind(DeviceController))
);

router.put(
  '/:deviceId/status',
  validate(deviceIdValidation),
  asyncHandler(DeviceController.updateStatus.bind(DeviceController))
);

export default router;
