/**
 * Color utility functions for interpolation and manipulation
 */

/**
 * Linearly interpolate between two hex colors
 * @param color1 First color in hex format (#RRGGBB)
 * @param color2 Second color in hex format (#RRGGBB)
 * @param t Interpolation factor (0-1)
 * @returns Interpolated color in hex format
 */
export const lerpColor = (color1: string, color2: string, t: number): string => {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);

  const r1 = (c1 >> 16) & 255;
  const g1 = (c1 >> 8) & 255;
  const b1 = c1 & 255;

  const r2 = (c2 >> 16) & 255;
  const g2 = (c2 >> 8) & 255;
  const b2 = c2 & 255;

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};
