/**
 * Weather and Time of Day Presets Configuration
 *
 * This file defines preset combinations of time and weather conditions
 * that are optimized for visual quality and recognizability.
 */

export type TimeOfDay =
  | 'midnight'
  | 'sunrise'
  | 'morning'
  | 'noon'
  | 'afternoon'
  | 'sunset'
  | 'dusk'
  | 'night';

export type WeatherType = 'clear' | 'cloudy' | 'rainy' | 'foggy' | 'snowy';

export interface TimePreset {
  name: string;
  label: string;
  emoji: string;
  hour: number;
  minute: number;
  description: string;
}

export interface WeatherPreset {
  name: WeatherType;
  label: string;
  emoji: string;
  description: string;
}

/**
 * Time of Day Presets
 *
 * These times are optimized to showcase the most dramatic and recognizable
 * lighting conditions throughout the day.
 */
export const TIME_PRESETS: Record<TimeOfDay, TimePreset> = {
  midnight: {
    name: 'midnight',
    label: 'Midnight',
    emoji: '🌙',
    hour: 0,
    minute: 0,
    description: 'Deep night with stars and moon at zenith',
  },
  sunrise: {
    name: 'sunrise',
    label: 'Sunrise',
    emoji: '🌅',
    hour: 6,
    minute: 0,
    description: 'Golden hour beginning, warm orange and pink tones',
  },
  morning: {
    name: 'morning',
    label: 'Morning',
    emoji: '🌄',
    hour: 9,
    minute: 0,
    description: 'Bright clear morning light, fresh and crisp',
  },
  noon: {
    name: 'noon',
    label: 'Noon',
    emoji: '☀️',
    hour: 12,
    minute: 0,
    description: 'Peak sunlight, strong overhead illumination',
  },
  afternoon: {
    name: 'afternoon',
    label: 'Afternoon',
    emoji: '🌤️',
    hour: 15,
    minute: 0,
    description: 'Warm afternoon light, sun descending',
  },
  sunset: {
    name: 'sunset',
    label: 'Sunset',
    emoji: '🌇',
    hour: 18,
    minute: 30,
    description: 'Golden hour ending, dramatic warm colors',
  },
  dusk: {
    name: 'dusk',
    label: 'Dusk',
    emoji: '🌆',
    hour: 20,
    minute: 0,
    description: 'Twilight period, deep blue sky with purple tones',
  },
  night: {
    name: 'night',
    label: 'Night',
    emoji: '✨',
    hour: 22,
    minute: 0,
    description: 'Clear night with visible stars and moon',
  },
};

/**
 * Weather Condition Presets
 *
 * Five distinct weather types with optimized visual parameters.
 */
export const WEATHER_PRESETS: Record<WeatherType, WeatherPreset> = {
  clear: {
    name: 'clear',
    label: 'Clear',
    emoji: '☀️',
    description: 'Clear skies with minimal clouds',
  },
  cloudy: {
    name: 'cloudy',
    label: 'Cloudy',
    emoji: '☁️',
    description: 'Overcast with dense cloud cover',
  },
  rainy: {
    name: 'rainy',
    label: 'Rainy',
    emoji: '🌧️',
    description: 'Rain with dark clouds and reduced visibility',
  },
  foggy: {
    name: 'foggy',
    label: 'Foggy',
    emoji: '🌫️',
    description: 'Heavy fog with limited visibility',
  },
  snowy: {
    name: 'snowy',
    label: 'Snowy',
    emoji: '❄️',
    description: 'Falling snow with cold atmosphere',
  },
};

/**
 * Preset combinations that work particularly well together
 *
 * These are suggested combinations for the best visual results.
 */
export const RECOMMENDED_COMBINATIONS = [
  { time: 'sunrise', weather: 'clear', reason: 'Dramatic golden hour colors' },
  { time: 'noon', weather: 'clear', reason: 'Bright, vibrant scene' },
  { time: 'sunset', weather: 'cloudy', reason: 'Beautiful cloud textures' },
  { time: 'dusk', weather: 'rainy', reason: 'Moody atmosphere' },
  { time: 'night', weather: 'clear', reason: 'Stars and moon visibility' },
  { time: 'morning', weather: 'foggy', reason: 'Mysterious morning mist' },
  { time: 'afternoon', weather: 'cloudy', reason: 'Soft, diffused lighting' },
  { time: 'midnight', weather: 'snowy', reason: 'Peaceful winter night' },
];

/**
 * Get time preset by name
 */
export function getTimePreset(timeOfDay: TimeOfDay): TimePreset {
  return TIME_PRESETS[timeOfDay];
}

/**
 * Get weather preset by name
 */
export function getWeatherPreset(weather: WeatherType): WeatherPreset {
  return WEATHER_PRESETS[weather];
}

/**
 * Get all time presets as array
 */
export function getAllTimePresets(): TimePreset[] {
  return Object.values(TIME_PRESETS);
}

/**
 * Get all weather presets as array
 */
export function getAllWeatherPresets(): WeatherPreset[] {
  return Object.values(WEATHER_PRESETS);
}

/**
 * Apply a time preset to a Date object
 */
export function applyTimePreset(date: Date, preset: TimePreset): Date {
  const newDate = new Date(date);
  newDate.setHours(preset.hour, preset.minute, 0, 0);
  return newDate;
}
