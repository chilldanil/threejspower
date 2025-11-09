/**
 * Sun position calculation utilities using SunCalc library
 */

import * as SunCalc from 'suncalc';
import type { SunPosition } from '../types/three';

/**
 * Calculate sun position based on date and geographic location
 * @param date Current date and time
 * @param latitude Geographic latitude
 * @param longitude Geographic longitude
 * @returns Sun position with altitude, azimuth, and 3D coordinates
 */
export const getSunPosition = (
  date: Date,
  latitude: number,
  longitude: number
): SunPosition => {
  const sunPos = SunCalc.getPosition(date, latitude, longitude);
  const sunDistance = 100;

  return {
    altitude: sunPos.altitude, // angle above horizon
    azimuth: sunPos.azimuth,   // angle from north
    x: sunDistance * Math.cos(sunPos.altitude) * Math.sin(sunPos.azimuth),
    y: sunDistance * Math.sin(sunPos.altitude),
    z: sunDistance * Math.cos(sunPos.altitude) * Math.cos(sunPos.azimuth)
  };
};
