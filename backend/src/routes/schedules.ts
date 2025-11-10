import { Router } from 'express';
import ScheduleController from '../controllers/ScheduleController';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  validate,
  deviceIdValidation,
  uuidValidation,
  scheduleCreateValidation,
  scheduleUpdateValidation
} from '../middleware/validation';

const router = Router();

// All schedule routes require authentication
router.use(authenticateToken);

// Create a new schedule for a device
router.post(
  '/:deviceId',
  validate([...deviceIdValidation, ...scheduleCreateValidation]),
  asyncHandler(ScheduleController.createSchedule.bind(ScheduleController))
);

// Get all schedules for a device
router.get(
  '/:deviceId',
  validate(deviceIdValidation),
  asyncHandler(ScheduleController.getSchedules.bind(ScheduleController))
);

// Get a specific schedule
router.get(
  '/:deviceId/:scheduleId',
  validate([...deviceIdValidation, { ...uuidValidation[0], location: 'params', fields: ['scheduleId'] }]),
  asyncHandler(ScheduleController.getSchedule.bind(ScheduleController))
);

// Update a schedule
router.put(
  '/:deviceId/:scheduleId',
  validate([
    ...deviceIdValidation,
    { ...uuidValidation[0], location: 'params', fields: ['scheduleId'] },
    ...scheduleUpdateValidation
  ]),
  asyncHandler(ScheduleController.updateSchedule.bind(ScheduleController))
);

// Delete a schedule
router.delete(
  '/:deviceId/:scheduleId',
  validate([...deviceIdValidation, { ...uuidValidation[0], location: 'params', fields: ['scheduleId'] }]),
  asyncHandler(ScheduleController.deleteSchedule.bind(ScheduleController))
);

// Toggle schedule enabled/disabled
router.patch(
  '/:deviceId/:scheduleId/toggle',
  validate([...deviceIdValidation, { ...uuidValidation[0], location: 'params', fields: ['scheduleId'] }]),
  asyncHandler(ScheduleController.toggleSchedule.bind(ScheduleController))
);

export default router;
