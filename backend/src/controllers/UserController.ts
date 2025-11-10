import { Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { generateToken } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class UserController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError('Email already registered', 409);
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        passwordHash,
        name,
        preferences: {
          temperatureUnit: 'celsius',
          notificationsEnabled: true,
          theme: 'auto',
          language: 'en'
        }
      });

      const token = generateToken(user.id, user.email);

      logger.info(`User registered: ${user.email}`);

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          preferences: user.preferences
        },
        token
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Registration error:', error);
      throw new AppError('Registration failed', 500);
    }
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      const token = generateToken(user.id, user.email);

      logger.info(`User logged in: ${user.email}`);

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          preferences: user.preferences
        },
        token
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Login error:', error);
      throw new AppError('Login failed', 500);
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        preferences: user.preferences,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Get profile error:', error);
      throw new AppError('Failed to get profile', 500);
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const { name, preferences } = req.body;

      if (name) user.name = name;
      if (preferences) {
        user.preferences = {
          ...user.preferences,
          ...preferences
        };
      }

      await user.save();

      logger.info(`User profile updated: ${user.email}`);

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          preferences: user.preferences
        }
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update profile error:', error);
      throw new AppError('Failed to update profile', 500);
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const { currentPassword, newPassword } = req.body;

      const user = await User.findByPk(req.user.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValidPassword) {
        throw new AppError('Current password is incorrect', 401);
      }

      user.passwordHash = await bcrypt.hash(newPassword, 10);
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);

      res.json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Change password error:', error);
      throw new AppError('Failed to change password', 500);
    }
  }

  async deleteAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      await user.destroy();

      logger.info(`User account deleted: ${user.email}`);

      res.json({
        message: 'Account deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Delete account error:', error);
      throw new AppError('Failed to delete account', 500);
    }
  }
}

export default new UserController();
