/**
 * Sky management module - handles sky background, sun, moon, and stars
 */

import * as THREE from 'three';
import type { SkyColors, SunPosition, MoonPosition } from '../../types/three';
import { WEATHER_CONFIG } from '../../config/weatherConfig';

/**
 * Creates and updates the sky background gradient
 */
export const createSkyBackground = (scene: THREE.Scene, skyColors: SkyColors): void => {
  const canvasBg = document.createElement('canvas');
  canvasBg.width = 2;
  canvasBg.height = 512;
  const ctx = canvasBg.getContext('2d')!;
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, skyColors.top);
  gradient.addColorStop(0.5, skyColors.middle);
  gradient.addColorStop(1, skyColors.bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 2, 512);
  scene.background = new THREE.CanvasTexture(canvasBg);

  // Update fog color and density based on weather
  const fogColor = new THREE.Color(skyColors.middle);
  scene.fog = new THREE.Fog(fogColor.getHex(), skyColors.fogNear, skyColors.fogFar);
};

/**
 * Creates the sun sphere with glow effect
 */
export const createSun = (sunPos: SunPosition, skyColors: SkyColors) => {
  const sunGeometry = new THREE.SphereGeometry(8, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(skyColors.sunColor),
    fog: false
  });
  const sunSphere = new THREE.Mesh(sunGeometry, sunMaterial);
  sunSphere.position.set(sunPos.x * 0.9, sunPos.y * 0.9, sunPos.z * 0.9);

  // Add sun glow
  const sunGlowGeometry = new THREE.SphereGeometry(12, 32, 32);
  const sunGlowMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(skyColors.sunColor),
    transparent: true,
    opacity: 0.3,
    fog: false
  });
  const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
  sunGlow.position.copy(sunSphere.position);

  // Only show sun when above horizon
  sunSphere.visible = sunPos.altitude > -0.1;
  sunGlow.visible = sunPos.altitude > -0.1;

  return { sunSphere, sunGlow, sunMaterial, sunGlowMaterial };
};

/**
 * Creates the moon sphere with glow effect
 */
export const createMoon = (moonPos: MoonPosition, sunAltitude: number) => {
  const moonGeometry = new THREE.SphereGeometry(6, 32, 32);
  const moonMaterial = new THREE.MeshBasicMaterial({
    color: 0xe8e8ff,
    fog: false
  });
  const moonSphere = new THREE.Mesh(moonGeometry, moonMaterial);
  moonSphere.position.set(moonPos.x, moonPos.y, moonPos.z);

  // Moon glow
  const moonGlowGeometry = new THREE.SphereGeometry(8, 32, 32);
  const moonGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xaaaaff,
    transparent: true,
    opacity: 0.2,
    fog: false
  });
  const moonGlow = new THREE.Mesh(moonGlowGeometry, moonGlowMaterial);
  moonGlow.position.copy(moonSphere.position);

  // Only show moon at night
  moonSphere.visible = sunAltitude < -0.1;
  moonGlow.visible = sunAltitude < -0.1;

  return { moonSphere, moonGlow };
};

/**
 * Creates the starfield
 */
export const createStars = (sunAltitude: number) => {
  const starsGeometry = new THREE.BufferGeometry();
  const starPositions: number[] = [];

  for (let i = 0; i < WEATHER_CONFIG.STAR_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const radius = WEATHER_CONFIG.STAR_DISTANCE_MIN + Math.random() * WEATHER_CONFIG.STAR_DISTANCE_RANGE;

    starPositions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );
  }

  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starsMaterial = new THREE.PointsMaterial({
    color: WEATHER_CONFIG.STAR_COLOR,
    size: WEATHER_CONFIG.STAR_SIZE,
    transparent: true,
    opacity: sunAltitude < -0.1 ? 1 : 0,
    fog: false,
    sizeAttenuation: true
  });
  const stars = new THREE.Points(starsGeometry, starsMaterial);

  return { stars, starsMaterial };
};

/**
 * Updates sun position and visibility
 */
export const updateSun = (
  sunSphere: THREE.Mesh,
  sunGlow: THREE.Mesh,
  sunMaterial: THREE.MeshBasicMaterial,
  sunGlowMaterial: THREE.MeshBasicMaterial,
  sunPos: SunPosition,
  skyColors: SkyColors,
  isDay: boolean
): void => {
  sunSphere.position.set(sunPos.x * 0.9, sunPos.y * 0.9, sunPos.z * 0.9);
  sunGlow.position.copy(sunSphere.position);
  sunSphere.visible = isDay;
  sunGlow.visible = isDay;
  sunMaterial.color = new THREE.Color(skyColors.sunColor);
  sunGlowMaterial.color = new THREE.Color(skyColors.sunColor);
};

/**
 * Updates moon position and visibility
 */
export const updateMoon = (
  moonSphere: THREE.Mesh,
  moonGlow: THREE.Mesh,
  moonPos: MoonPosition,
  isNight: boolean
): void => {
  moonSphere.position.set(moonPos.x, moonPos.y, moonPos.z);
  moonGlow.position.copy(moonSphere.position);
  moonSphere.visible = isNight;
  moonGlow.visible = isNight;
};

/**
 * Updates stars opacity based on sun altitude
 */
export const updateStars = (
  starsMaterial: THREE.PointsMaterial,
  sunAltitude: number,
  time: number
): void => {
  const isNight = sunAltitude < -0.1;
  starsMaterial.opacity = isNight ? Math.min(1, (Math.abs(sunAltitude) - 0.1) / 0.5) : 0;

  // Twinkle effect
  if (starsMaterial.opacity > 0) {
    const twinkle = (Math.sin(time * 5) + 1) * 0.05;
    starsMaterial.size = WEATHER_CONFIG.STAR_SIZE + twinkle;
  }
};
