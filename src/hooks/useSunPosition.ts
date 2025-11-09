/**
 * Custom hook for managing sun position calculations
 */

import { useMemo } from 'react';
import { getSunPosition } from '../utilities/sunPositionCalculator';
import type { SunPosition, MoonPosition } from '../types/three';

export const useSunPosition = (
  currentTime: Date,
  latitude: number,
  longitude: number
) => {
  const sunPosition = useMemo<SunPosition>(() => {
    return getSunPosition(currentTime, latitude, longitude);
  }, [currentTime, latitude, longitude]);

  const moonPosition = useMemo<MoonPosition>(() => ({
    x: -sunPosition.x * 0.9,
    y: Math.abs(sunPosition.y * 0.9) + 10,
    z: -sunPosition.z * 0.9
  }), [sunPosition]);

  const isNight = sunPosition.altitude < -0.1;
  const isDay = sunPosition.altitude > -0.1;

  return {
    sunPosition,
    moonPosition,
    isNight,
    isDay
  };
};
