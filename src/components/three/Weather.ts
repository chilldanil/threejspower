/**
 * Weather effects module - handles clouds, rain, and snow
 */

import * as THREE from 'three';
import { WEATHER_CONFIG } from '../../config/weatherConfig';

/**
 * Creates procedural clouds based on weather type
 */
export const createClouds = (scene: THREE.Scene, weatherType: string): THREE.Mesh[] => {
  const clouds: THREE.Mesh[] = [];

  const cloudCount = WEATHER_CONFIG.CLOUD_COUNT[weatherType as keyof typeof WEATHER_CONFIG.CLOUD_COUNT] || 15;
  const baseOpacity = WEATHER_CONFIG.CLOUD_OPACITY[weatherType as keyof typeof WEATHER_CONFIG.CLOUD_OPACITY] || 0.15;

  for (let i = 0; i < cloudCount; i++) {
    const cloudGeometry = new THREE.SphereGeometry(
      WEATHER_CONFIG.CLOUD_SIZE_MIN + Math.random() * WEATHER_CONFIG.CLOUD_SIZE_RANGE,
      8,
      8
    );
    let cloudColor: number = WEATHER_CONFIG.CLOUD_COLOR_NORMAL;
    if (weatherType === 'rainy') cloudColor = WEATHER_CONFIG.CLOUD_COLOR_RAINY;
    if (weatherType === 'snowy') cloudColor = WEATHER_CONFIG.CLOUD_COLOR_SNOWY;

    const cloudMaterial = new THREE.MeshBasicMaterial({
      color: cloudColor as THREE.ColorRepresentation,
      transparent: true,
      opacity: baseOpacity + Math.random() * WEATHER_CONFIG.CLOUD_OPACITY_VARIATION,
      fog: false
    });
    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);

    // Position clouds in a ring around the scene
    const angle = (i / cloudCount) * Math.PI * 2;
    const distance = WEATHER_CONFIG.CLOUD_DISTANCE_MIN + Math.random() * WEATHER_CONFIG.CLOUD_DISTANCE_RANGE;
    const heightOffset = weatherType === 'foggy'
      ? WEATHER_CONFIG.CLOUD_HEIGHT_OFFSET_FOGGY
      : WEATHER_CONFIG.CLOUD_HEIGHT_OFFSET_NORMAL;

    cloud.position.set(
      Math.cos(angle) * distance,
      heightOffset + Math.random() * WEATHER_CONFIG.CLOUD_HEIGHT_VARIATION,
      Math.sin(angle) * distance
    );

    cloud.scale.set(
      1 + Math.random() * 0.5,
      0.6 + Math.random() * 0.3,
      1 + Math.random() * 0.5
    );

    scene.add(cloud);
    clouds.push(cloud);
  }

  return clouds;
};

/**
 * Creates rain particle system
 */
export const createRain = (isRainy: boolean) => {
  const rainGeometry = new THREE.BufferGeometry();
  const rainPositions: number[] = [];
  const rainVelocities: number[] = [];

  for (let i = 0; i < WEATHER_CONFIG.RAIN_COUNT; i++) {
    rainPositions.push(
      Math.random() * WEATHER_CONFIG.RAIN_SPREAD - WEATHER_CONFIG.RAIN_SPREAD / 2,
      Math.random() * WEATHER_CONFIG.RAIN_HEIGHT,
      Math.random() * WEATHER_CONFIG.RAIN_SPREAD - WEATHER_CONFIG.RAIN_SPREAD / 2
    );
    rainVelocities.push(Math.random() * WEATHER_CONFIG.RAIN_VELOCITY_RANGE + WEATHER_CONFIG.RAIN_VELOCITY_MIN);
  }

  rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rainPositions, 3));
  const rainMaterial = new THREE.PointsMaterial({
    color: WEATHER_CONFIG.RAIN_COLOR,
    size: WEATHER_CONFIG.RAIN_SIZE,
    transparent: true,
    opacity: isRainy ? WEATHER_CONFIG.RAIN_OPACITY : 0,
    fog: true
  });
  const rain = new THREE.Points(rainGeometry, rainMaterial);

  return { rain, rainMaterial, rainVelocities };
};

/**
 * Animates clouds with slow drift
 */
export const animateClouds = (clouds: THREE.Mesh[], time: number): void => {
  clouds.forEach((cloud, i) => {
    cloud.position.x += Math.sin(time * 0.1 + i) * 0.01;
    cloud.position.z += Math.cos(time * 0.1 + i) * 0.01;
    cloud.rotation.z += 0.0001;

    // Keep clouds in visible range
    const distance = Math.sqrt(cloud.position.x ** 2 + cloud.position.z ** 2);
    if (distance > 120) {
      const angle = Math.atan2(cloud.position.z, cloud.position.x) + Math.PI;
      cloud.position.x = Math.cos(angle) * 70;
      cloud.position.z = Math.sin(angle) * 70;
    }
  });
};

/**
 * Animates rain particles
 */
export const animateRain = (
  rainGeometry: THREE.BufferGeometry,
  rainVelocities: number[],
  rainMaterial: THREE.PointsMaterial
): void => {
  if (rainMaterial.opacity > 0) {
    const positions = rainGeometry.attributes.position.array as Float32Array;
    for (let i = 0; i < WEATHER_CONFIG.RAIN_COUNT; i++) {
      // Move rain down
      positions[i * 3 + 1] -= rainVelocities[i];

      // Reset rain to top when it falls below ground
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = WEATHER_CONFIG.RAIN_HEIGHT;
      }
    }
    rainGeometry.attributes.position.needsUpdate = true;
  }
};

/**
 * Creates snow particle system
 */
export const createSnow = (isSnowy: boolean) => {
  const snowGeometry = new THREE.BufferGeometry();
  const snowPositions: number[] = [];
  const snowVelocities: number[] = [];
  const snowDrift: number[] = [];

  for (let i = 0; i < WEATHER_CONFIG.SNOW_COUNT; i++) {
    snowPositions.push(
      Math.random() * WEATHER_CONFIG.SNOW_SPREAD - WEATHER_CONFIG.SNOW_SPREAD / 2,
      Math.random() * WEATHER_CONFIG.SNOW_HEIGHT,
      Math.random() * WEATHER_CONFIG.SNOW_SPREAD - WEATHER_CONFIG.SNOW_SPREAD / 2
    );
    snowVelocities.push(Math.random() * WEATHER_CONFIG.SNOW_VELOCITY_RANGE + WEATHER_CONFIG.SNOW_VELOCITY_MIN);
    snowDrift.push(Math.random() * Math.PI * 2); // Random drift phase
  }

  snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(snowPositions, 3));
  const snowMaterial = new THREE.PointsMaterial({
    color: WEATHER_CONFIG.SNOW_COLOR,
    size: WEATHER_CONFIG.SNOW_SIZE,
    transparent: true,
    opacity: isSnowy ? WEATHER_CONFIG.SNOW_OPACITY : 0,
    fog: true
  });
  const snow = new THREE.Points(snowGeometry, snowMaterial);

  return { snow, snowMaterial, snowVelocities, snowDrift };
};

/**
 * Animates snow particles with gentle falling and horizontal drift
 */
export const animateSnow = (
  snowGeometry: THREE.BufferGeometry,
  snowVelocities: number[],
  snowDrift: number[],
  snowMaterial: THREE.PointsMaterial,
  time: number
): void => {
  if (snowMaterial.opacity > 0) {
    const positions = snowGeometry.attributes.position.array as Float32Array;
    for (let i = 0; i < WEATHER_CONFIG.SNOW_COUNT; i++) {
      // Move snow down slowly
      positions[i * 3 + 1] -= snowVelocities[i];

      // Add horizontal drift
      positions[i * 3] += Math.sin(time * 0.001 + snowDrift[i]) * WEATHER_CONFIG.SNOW_DRIFT_SPEED;
      positions[i * 3 + 2] += Math.cos(time * 0.001 + snowDrift[i]) * WEATHER_CONFIG.SNOW_DRIFT_SPEED;

      // Reset snow to top when it falls below ground
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = WEATHER_CONFIG.SNOW_HEIGHT;
        positions[i * 3] = Math.random() * WEATHER_CONFIG.SNOW_SPREAD - WEATHER_CONFIG.SNOW_SPREAD / 2;
        positions[i * 3 + 2] = Math.random() * WEATHER_CONFIG.SNOW_SPREAD - WEATHER_CONFIG.SNOW_SPREAD / 2;
      }
    }
    snowGeometry.attributes.position.needsUpdate = true;
  }
};

/**
 * Removes clouds from scene
 */
export const removeClouds = (scene: THREE.Scene, clouds: THREE.Mesh[]): void => {
  clouds.forEach(cloud => scene.remove(cloud));
};
