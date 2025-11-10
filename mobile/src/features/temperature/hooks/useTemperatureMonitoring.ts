import { useEffect, useState, useCallback } from 'react';
import { TemperatureReading, OperationMode } from '@/types/temperature.types';
import MqttManager from '@/services/mqtt/MqttManager';
import { APP_CONFIG } from '@/app/config/app.config';

interface UseTemperatureMonitoringResult {
  temperatureData: TemperatureReading;
  isConnected: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export const useTemperatureMonitoring = (
  deviceId: string
): UseTemperatureMonitoringResult => {
  const [temperatureData, setTemperatureData] = useState<TemperatureReading>({
    foodTemp: 0,
    ambientTemp: 0,
    humidity: 0,
    timestamp: Date.now(),
    unit: 'celsius',
    mode: OperationMode.IDLE,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const handleTemperatureUpdate = useCallback((reading: TemperatureReading) => {
    setTemperatureData(reading);
    setLastUpdate(new Date());
    setIsConnected(true);
    setError(null);
  }, []);

  useEffect(() => {
    // Subscribe to temperature updates
    MqttManager.onTemperatureUpdate(handleTemperatureUpdate);

    // Connection timeout checker
    const timeoutChecker = setInterval(() => {
      if (lastUpdate) {
        const timeSinceLastUpdate = Date.now() - lastUpdate.getTime();
        if (timeSinceLastUpdate > APP_CONFIG.TEMPERATURE.CONNECTION_TIMEOUT) {
          setIsConnected(false);
          setError('Device connection timeout');
        }
      }
    }, 5000);

    return () => {
      clearInterval(timeoutChecker);
    };
  }, [deviceId, lastUpdate, handleTemperatureUpdate]);

  return {
    temperatureData,
    isConnected,
    error,
    lastUpdate,
  };
};
