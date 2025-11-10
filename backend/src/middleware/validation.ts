import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      next();
      return;
    }

    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: errors.array().map(err => ({
        field: err.type === 'field' ? err.path : undefined,
        message: err.msg
      }))
    });
  };
};

// User validation rules
export const userRegistrationValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters')
];

export const userLoginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

export const userUpdateValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('preferences').optional().isObject().withMessage('Preferences must be an object'),
  body('preferences.temperatureUnit')
    .optional()
    .isIn(['celsius', 'fahrenheit'])
    .withMessage('Temperature unit must be celsius or fahrenheit'),
  body('preferences.notificationsEnabled').optional().isBoolean().withMessage('Must be a boolean'),
  body('preferences.theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Theme must be light, dark, or auto'),
  body('preferences.language').optional().isString().withMessage('Language must be a string')
];

// Device validation rules
export const deviceRegistrationValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Device name is required (1-100 characters)'),
  body('firmwareVersion').optional().matches(/^\d+\.\d+\.\d+$/).withMessage('Invalid firmware version format'),
  body('wifiSSID').optional().trim().isLength({ max: 32 }).withMessage('WiFi SSID too long')
];

export const deviceUpdateValidation = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Device name must be 1-100 characters'),
  body('settings').optional().isObject().withMessage('Settings must be an object'),
  body('settings.temperatureUnit')
    .optional()
    .isIn(['celsius', 'fahrenheit'])
    .withMessage('Temperature unit must be celsius or fahrenheit'),
  body('settings.notificationsEnabled').optional().isBoolean().withMessage('Must be a boolean'),
  body('settings.autoUpdate').optional().isBoolean().withMessage('Must be a boolean')
];

export const deviceCommandValidation = [
  body('command')
    .isIn(['heat_start', 'heat_stop', 'cool_start', 'cool_stop', 'power_off', 'set_target_temp'])
    .withMessage('Invalid command'),
  body('targetTemp')
    .optional()
    .isFloat({ min: -20, max: 100 })
    .withMessage('Target temperature must be between -20 and 100'),
  body('maxDuration')
    .optional()
    .isInt({ min: 60, max: 28800 })
    .withMessage('Duration must be between 60 and 28800 seconds')
];

// Temperature validation rules
export const temperatureQueryValidation = [
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative')
];

// Schedule validation rules
export const scheduleCreateValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Schedule name is required (1-100 characters)'),
  body('mode')
    .isIn(['idle', 'heating', 'cooling', 'maintaining'])
    .withMessage('Invalid operation mode'),
  body('targetTemp').isFloat({ min: -20, max: 100 }).withMessage('Target temperature must be between -20 and 100'),
  body('startTime').isISO8601().withMessage('Invalid start time format'),
  body('duration').optional().isInt({ min: 60 }).withMessage('Duration must be at least 60 seconds'),
  body('recurring').optional().isObject().withMessage('Recurring must be an object'),
  body('recurring.enabled').optional().isBoolean().withMessage('Must be a boolean'),
  body('recurring.pattern')
    .optional()
    .isIn(['once', 'daily', 'weekdays', 'weekends', 'custom'])
    .withMessage('Invalid recurring pattern'),
  body('enabled').optional().isBoolean().withMessage('Must be a boolean'),
  body('notifications').optional().isBoolean().withMessage('Must be a boolean')
];

export const scheduleUpdateValidation = [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Schedule name must be 1-100 characters'),
  body('mode')
    .optional()
    .isIn(['idle', 'heating', 'cooling', 'maintaining'])
    .withMessage('Invalid operation mode'),
  body('targetTemp')
    .optional()
    .isFloat({ min: -20, max: 100 })
    .withMessage('Target temperature must be between -20 and 100'),
  body('startTime').optional().isISO8601().withMessage('Invalid start time format'),
  body('duration').optional().isInt({ min: 60 }).withMessage('Duration must be at least 60 seconds'),
  body('enabled').optional().isBoolean().withMessage('Must be a boolean'),
  body('notifications').optional().isBoolean().withMessage('Must be a boolean')
];

// UUID validation
export const uuidValidation = [
  param('id').isUUID().withMessage('Invalid ID format')
];

export const deviceIdValidation = [
  param('deviceId').isUUID().withMessage('Invalid device ID format')
];
