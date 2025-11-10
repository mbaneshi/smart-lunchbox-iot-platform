import { Router } from 'express';
import userRoutes from './users';
import deviceRoutes from './devices';
import temperatureRoutes from './temperature';
import scheduleRoutes from './schedules';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API version
router.get('/version', (req, res) => {
  res.json({
    version: '1.0.0',
    api: 'v1',
    endpoints: {
      users: '/api/users',
      devices: '/api/devices',
      temperature: '/api/temperature',
      schedules: '/api/schedules'
    }
  });
});

// Mount route modules
router.use('/users', userRoutes);
router.use('/devices', deviceRoutes);
router.use('/temperature', temperatureRoutes);
router.use('/schedules', scheduleRoutes);

export default router;
