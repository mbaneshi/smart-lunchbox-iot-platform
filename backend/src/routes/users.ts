import { Router } from 'express';
import UserController from '../controllers/UserController';
import { authenticateToken } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  validate,
  userRegistrationValidation,
  userLoginValidation,
  userUpdateValidation
} from '../middleware/validation';

const router = Router();

// Public routes
router.post(
  '/register',
  validate(userRegistrationValidation),
  asyncHandler(UserController.register.bind(UserController))
);

router.post(
  '/login',
  validate(userLoginValidation),
  asyncHandler(UserController.login.bind(UserController))
);

// Protected routes
router.get(
  '/profile',
  authenticateToken,
  asyncHandler(UserController.getProfile.bind(UserController))
);

router.put(
  '/profile',
  authenticateToken,
  validate(userUpdateValidation),
  asyncHandler(UserController.updateProfile.bind(UserController))
);

router.post(
  '/change-password',
  authenticateToken,
  asyncHandler(UserController.changePassword.bind(UserController))
);

router.delete(
  '/account',
  authenticateToken,
  asyncHandler(UserController.deleteAccount.bind(UserController))
);

export default router;
