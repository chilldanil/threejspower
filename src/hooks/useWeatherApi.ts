/**
 * React hook for fetching and managing real-time weather data
 */

import { useState, useEffect, useCallback } from 'react';
import type { WeatherType } from '../config/presetConfig';
import {
  getCurrentWeatherPreset,
  formatWeatherInfo,
  type OpenWeatherResponse
} from '../utilities/weatherApi';

export interface UseWeatherApiResult {
  weatherType: WeatherType | null;
  weatherData: OpenWeatherResponse | null;
  weatherInfo: string | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export interface UseWeatherApiOptions {
  latitude: number;
  longitude: number;
  enabled?: boolean;
  refreshInterval?: number; // in milliseconds, default: 10 minutes
}

/**
 * Hook to fetch and manage real-time weather data from OpenWeatherMap
 *
 * @param options Configuration options
 * @returns Weather data and control functions
 */
export function useWeatherApi({
  latitude,
  longitude,
  enabled = true,
  refreshInterval = 600000 // 10 minutes default
}: UseWeatherApiOptions): UseWeatherApiResult {
  const [weatherType, setWeatherType] = useState<WeatherType | null>(null);
  const [weatherData, setWeatherData] = useState<OpenWeatherResponse | null>(null);
  const [weatherInfo, setWeatherInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getCurrentWeatherPreset(latitude, longitude);
      setWeatherType(result.weatherType);
      setWeatherData(result.weatherData);
      setWeatherInfo(formatWeatherInfo(result.weatherData));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error('Failed to fetch weather:', error);
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, enabled]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchWeather();
    }
  }, [enabled, fetchWeather]);

  // Auto-refresh interval
  useEffect(() => {
    if (!enabled || !refreshInterval) return;

    const intervalId = setInterval(() => {
      fetchWeather();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [enabled, refreshInterval, fetchWeather]);

  return {
    weatherType,
    weatherData,
    weatherInfo,
    isLoading,
    error,
    refetch: fetchWeather
  };
}
