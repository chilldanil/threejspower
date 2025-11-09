/**
 * Easing functions for smooth animations
 */

/**
 * Cubic ease-in-out function for smooth interpolation
 * @param t Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/**
 * Quadratic ease-in function
 * @param t Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export const easeInQuad = (t: number): number => {
  return t * t;
};

/**
 * Quadratic ease-out function
 * @param t Progress value between 0 and 1
 * @returns Eased value between 0 and 1
 */
export const easeOutQuad = (t: number): number => {
  return t * (2 - t);
};
