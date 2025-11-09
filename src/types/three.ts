/**
 * TypeScript type definitions for the Three.js scroll house viewer application
 */

export interface CameraKeyframe {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov?: number;
  label: string;
  description: string;
}

export interface WeatherCondition {
  type: 'clear' | 'cloudy' | 'rainy' | 'foggy' | 'snowy';
  intensity: number;
}

export interface ScrollHouseViewerProps {
  modelPath?: string;
  latitude?: number;
  longitude?: number;
  testMode?: boolean;
  testTime?: Date;
  testWeather?: WeatherCondition;
  onTimeUpdate?: (time: Date) => void;
}

export interface SunPosition {
  altitude: number;
  azimuth: number;
  x: number;
  y: number;
  z: number;
}

export interface SkyColors {
  top: string;
  middle: string;
  bottom: string;
  sunColor: string;
  ambientIntensity: number;
  sunIntensity: number;
  exposure: number;
  fogDensity: number;
  fogNear: number;
  fogFar: number;
}

export interface MoonPosition {
  x: number;
  y: number;
  z: number;
}
