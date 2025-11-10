/**
 * Sky color configuration and calculation based on sun altitude
 */

import { lerpColor } from '../utilities/colorUtils';
import type { WeatherCondition, SkyColors } from '../types/three';

/**
 * Get sky colors based on sun altitude and weather conditions
 * @param altitude Sun altitude in radians
 * @param weatherCondition Current weather condition
 * @returns Sky color configuration including fog settings
 */
export const getSkyColors = (altitude: number, weatherCondition: WeatherCondition): SkyColors => {
  const altitudeDeg = altitude * (180 / Math.PI);

  // Weather modifiers
  const weatherDarkness = weatherCondition.type === 'cloudy' ? 0.7 :
                         weatherCondition.type === 'rainy' ? 0.5 :
                         weatherCondition.type === 'foggy' ? 0.6 :
                         weatherCondition.type === 'snowy' ? 0.75 : 1.0;

  const baseColors = (() => {
    if (altitudeDeg < -18) {
      // Deep night - very dark
      return {
        top: '#000005',
        middle: '#000510',
        bottom: '#050510',
        sunColor: '#8888ff',
        ambientIntensity: 0.05,
        sunIntensity: 0,
        exposure: 0.4
      };
    } else if (altitudeDeg < -6) {
      // Twilight - stars fading
      const t = (altitudeDeg + 18) / 12;
      return {
        top: lerpColor('#000005', '#1a1a3e', t),
        middle: lerpColor('#000510', '#2d2561', t),
        bottom: lerpColor('#050510', '#5a3a2a', t),
        sunColor: '#ff6633',
        ambientIntensity: 0.05 + t * 0.15,
        sunIntensity: t * 0.3,
        exposure: 0.4 + t * 0.3
      };
    } else if (altitudeDeg < 0) {
      // Dawn/Dusk - golden hour begins
      const t = (altitudeDeg + 6) / 6;
      return {
        top: lerpColor('#1a1a3e', '#ff6b4a', t),
        middle: lerpColor('#2d2561', '#ff8855', t),
        bottom: lerpColor('#5a3a2a', '#ffaa66', t),
        sunColor: '#ffaa44',
        ambientIntensity: 0.2 + t * 0.3,
        sunIntensity: 0.3 + t * 1.0,
        exposure: 0.7 + t * 0.3
      };
    } else if (altitudeDeg < 15) {
      // Early morning/late evening - warm light
      const t = altitudeDeg / 15;
      return {
        top: lerpColor('#ff6b4a', '#87CEEB', t),
        middle: lerpColor('#ff8855', '#a0d0f0', t),
        bottom: lerpColor('#ffaa66', '#ffd89b', t),
        sunColor: '#ffeedd',
        ambientIntensity: 0.5 + t * 0.3,
        sunIntensity: 1.3 + t * 0.7,
        exposure: 1.0 + t * 0.3
      };
    } else {
      // Full daylight - bright and clear
      const t = Math.min((altitudeDeg - 15) / 45, 1);
      return {
        top: lerpColor('#87CEEB', '#4a90e2', t),
        middle: lerpColor('#a0d0f0', '#87CEEB', t),
        bottom: lerpColor('#ffd89b', '#b0e0ff', t),
        sunColor: '#fffaf0',
        ambientIntensity: 0.8 + t * 0.2,
        sunIntensity: 2.0 + t * 0.5,
        exposure: 1.3 + t * 0.2
      };
    }
  })();

  // Apply weather modifications
  const fogSettings = (() => {
    if (weatherCondition.type === 'foggy') {
      return { fogDensity: 0.02, fogNear: 10, fogFar: 60 };
    } else if (weatherCondition.type === 'snowy') {
      return { fogDensity: 0.01, fogNear: 30, fogFar: 100 };
    } else {
      return { fogDensity: 0.005, fogNear: 50, fogFar: 140 };
    }
  })();

  return {
    ...baseColors,
    ambientIntensity: baseColors.ambientIntensity * weatherDarkness,
    sunIntensity: baseColors.sunIntensity * weatherDarkness,
    exposure: baseColors.exposure * weatherDarkness,
    ...fogSettings
  };
};
