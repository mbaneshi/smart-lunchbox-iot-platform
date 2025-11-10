import { OperationMode } from './temperature.types';

export interface Schedule {
  id: string;
  deviceId: string;
  name: string;
  mode: OperationMode;
  targetTemp: number;
  startTime: Date;
  duration?: number; // seconds, null for "until target reached"
  recurring: RecurringPattern;
  enabled: boolean;
  notifications: boolean;
}

export interface RecurringPattern {
  enabled: boolean;
  pattern: RecurringType;
  daysOfWeek?: number[]; // 0-6, Sunday = 0
}

export enum RecurringType {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKDAYS = 'weekdays',
  WEEKENDS = 'weekends',
  CUSTOM = 'custom'
}

export interface CountdownTimer {
  id: string;
  deviceId: string;
  duration: number; // seconds
  remaining: number; // seconds
  status: TimerStatus;
  mode: OperationMode;
  targetTemp: number;
  startedAt?: Date;
}

export enum TimerStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface TimerNotification {
  id: string;
  timerId: string;
  type: TimerNotificationType;
  message: string;
  timestamp: Date;
}

export enum TimerNotificationType {
  STARTED = 'started',
  COMPLETED = 'completed',
  FAILED = 'failed',
  WARNING = 'warning'
}
