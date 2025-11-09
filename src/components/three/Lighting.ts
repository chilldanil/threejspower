/**
 * Lighting management module - handles all scene lighting
 */

import * as THREE from 'three';
import type { SkyColors, SunPosition, MoonPosition } from '../../types/three';
import { LIGHTING_CONFIG } from '../../config/lightingConfig';

export interface SceneLights {
  ambientLight: THREE.AmbientLight;
  sunLight: THREE.DirectionalLight;
  skyLight: THREE.DirectionalLight;
  hemiLight: THREE.HemisphereLight;
  moonLight: THREE.DirectionalLight;
}

/**
 * Creates all scene lights
 */
export const createLights = (
  sunPos: SunPosition,
  moonPos: MoonPosition,
  skyColors: SkyColors
): SceneLights => {
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, skyColors.ambientIntensity);

  // Sun (main directional light) - follows real sun position
  const sunLight = new THREE.DirectionalLight(
    new THREE.Color(skyColors.sunColor),
    skyColors.sunIntensity
  );
  sunLight.position.set(sunPos.x, sunPos.y, sunPos.z);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = LIGHTING_CONFIG.SUN_SHADOW_MAP_SIZE;
  sunLight.shadow.mapSize.height = LIGHTING_CONFIG.SUN_SHADOW_MAP_SIZE;
  sunLight.shadow.camera.left = -LIGHTING_CONFIG.SHADOW_CAMERA_SIZE;
  sunLight.shadow.camera.right = LIGHTING_CONFIG.SHADOW_CAMERA_SIZE;
  sunLight.shadow.camera.top = LIGHTING_CONFIG.SHADOW_CAMERA_SIZE;
  sunLight.shadow.camera.bottom = -LIGHTING_CONFIG.SHADOW_CAMERA_SIZE;
  sunLight.shadow.bias = LIGHTING_CONFIG.SHADOW_BIAS;
  sunLight.shadow.normalBias = LIGHTING_CONFIG.SHADOW_NORMAL_BIAS;

  // Sky/atmospheric fill light (opposite side of sun for realism)
  const skyLight = new THREE.DirectionalLight(
    LIGHTING_CONFIG.SKY_LIGHT_COLOR,
    LIGHTING_CONFIG.SKY_FILL_LIGHT_INTENSITY
  );
  skyLight.position.set(-sunPos.x * 0.3, 20, -sunPos.z * 0.3);

  // Hemisphere light for natural ambiance (sky and ground colors)
  const hemiLight = new THREE.HemisphereLight(
    new THREE.Color(skyColors.middle),
    new THREE.Color(skyColors.bottom),
    LIGHTING_CONFIG.HEMISPHERE_LIGHT_INTENSITY
  );

  // Moonlight (only active at night)
  const moonLight = new THREE.DirectionalLight(
    LIGHTING_CONFIG.MOONLIGHT_COLOR,
    LIGHTING_CONFIG.MOONLIGHT_BASE_INTENSITY
  );
  moonLight.position.set(moonPos.x, moonPos.y, moonPos.z);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.width = LIGHTING_CONFIG.MOON_SHADOW_MAP_SIZE;
  moonLight.shadow.mapSize.height = LIGHTING_CONFIG.MOON_SHADOW_MAP_SIZE;
  moonLight.shadow.camera.left = -LIGHTING_CONFIG.SHADOW_CAMERA_SIZE;
  moonLight.shadow.camera.right = LIGHTING_CONFIG.SHADOW_CAMERA_SIZE;
  moonLight.shadow.camera.top = LIGHTING_CONFIG.SHADOW_CAMERA_SIZE;
  moonLight.shadow.camera.bottom = -LIGHTING_CONFIG.SHADOW_CAMERA_SIZE;
  moonLight.visible = sunPos.altitude < -0.1;

  return {
    ambientLight,
    sunLight,
    skyLight,
    hemiLight,
    moonLight
  };
};

/**
 * Updates all lighting based on sun position and sky colors
 */
export const updateLights = (
  lights: SceneLights,
  sunPos: SunPosition,
  moonPos: MoonPosition,
  skyColors: SkyColors,
  isDay: boolean,
  isNight: boolean
): void => {
  // Update sun light
  lights.sunLight.position.set(sunPos.x, sunPos.y, sunPos.z);
  lights.sunLight.color = new THREE.Color(skyColors.sunColor);
  lights.sunLight.intensity = skyColors.sunIntensity;
  lights.sunLight.visible = isDay;

  // Update moonlight
  lights.moonLight.position.set(moonPos.x, moonPos.y, moonPos.z);
  lights.moonLight.visible = isNight;

  // Update ambient light
  lights.ambientLight.intensity = skyColors.ambientIntensity;

  // Update hemisphere light colors
  lights.hemiLight.color = new THREE.Color(skyColors.middle);
  lights.hemiLight.groundColor = new THREE.Color(skyColors.bottom);

  // Update sky light position (opposite of sun)
  lights.skyLight.position.set(-sunPos.x * 0.3, 20, -sunPos.z * 0.3);
};
