/**
 * Weather system configuration
 */

export const WEATHER_CONFIG = {
  // Cloud counts per weather type
  CLOUD_COUNT: {
    clear: 5,
    cloudy: 30,
    rainy: 40,
    foggy: 20,
    snowy: 35
  },

  // Base opacity per weather type
  CLOUD_OPACITY: {
    clear: 0.1,
    cloudy: 0.3,
    rainy: 0.4,
    foggy: 0.5,
    snowy: 0.35
  },

  // Cloud positioning
  CLOUD_DISTANCE_MIN: 60,
  CLOUD_DISTANCE_RANGE: 40,
  CLOUD_HEIGHT_OFFSET_NORMAL: 30,
  CLOUD_HEIGHT_OFFSET_FOGGY: 10,
  CLOUD_HEIGHT_VARIATION: 20,

  // Cloud appearance
  CLOUD_SIZE_MIN: 8,
  CLOUD_SIZE_RANGE: 12,
  CLOUD_OPACITY_VARIATION: 0.15,

  // Cloud colors
  CLOUD_COLOR_NORMAL: 0xffffff,
  CLOUD_COLOR_RAINY: 0x888888,
  CLOUD_COLOR_SNOWY: 0xcccccc,

  // Rain configuration
  RAIN_COUNT: 1000,
  RAIN_SIZE: 0.1,
  RAIN_OPACITY: 0.6,
  RAIN_COLOR: 0xaaaaaa,
  RAIN_SPREAD: 100,
  RAIN_HEIGHT: 50,
  RAIN_VELOCITY_MIN: 0.1,
  RAIN_VELOCITY_RANGE: 0.1,

  // Snow configuration
  SNOW_COUNT: 800,
  SNOW_SIZE: 0.3,
  SNOW_OPACITY: 0.8,
  SNOW_COLOR: 0xffffff,
  SNOW_SPREAD: 100,
  SNOW_HEIGHT: 50,
  SNOW_VELOCITY_MIN: 0.03,
  SNOW_VELOCITY_RANGE: 0.02,
  SNOW_DRIFT_SPEED: 0.02,  // Horizontal drift

  // Stars configuration
  STAR_COUNT: 2000,
  STAR_SIZE: 0.5,
  STAR_COLOR: 0xffffff,
  STAR_DISTANCE_MIN: 200,
  STAR_DISTANCE_RANGE: 100
} as const;
