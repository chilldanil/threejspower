/**
 * Lighting configuration constants
 */

export const LIGHTING_CONFIG = {
  // Shadow map sizes
  SUN_SHADOW_MAP_SIZE: 4096,
  MOON_SHADOW_MAP_SIZE: 2048,

  // Shadow camera bounds
  SHADOW_CAMERA_SIZE: 50,

  // Shadow biases
  SHADOW_BIAS: -0.0001,
  SHADOW_NORMAL_BIAS: 0.02,

  // Light intensities
  SKY_FILL_LIGHT_INTENSITY: 0.3,
  HEMISPHERE_LIGHT_INTENSITY: 0.4,
  MOONLIGHT_BASE_INTENSITY: 0.3,

  // Colors
  SKY_LIGHT_COLOR: 0x87CEEB,
  MOONLIGHT_COLOR: 0x8888ff,
  MOON_GLOW_COLOR: 0xaaaaff,

  // Distances
  SUN_DISTANCE: 100,
} as const;
