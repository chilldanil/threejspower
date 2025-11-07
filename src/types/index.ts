// Core application types

export type RenderEngine = 'threejs' | 'babylonjs';

export type CameraMode = 'orbit' | 'free-fly' | 'first-person';

export type ViewMode = 'demo' | 'house' | 'landing';

export interface SceneConfig {
  engine: RenderEngine;
  enableShadows: boolean;
  enablePostProcessing: boolean;
  enableHDR: boolean;
  cameraMode: CameraMode;
  ambientLightIntensity: number;
  directionalLightIntensity: number;
  pointLightIntensity: number;
}

export interface LayerVisibility {
  pointCloud: boolean;
  buildings: boolean;
  terrain: boolean;
  gisMap: boolean;
  models: boolean;
}

export interface PointCloudData {
  positions: Float32Array;
  colors: Float32Array;
  intensities?: Float32Array;
  classifications?: Uint8Array;
  count: number;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface CityBuilding {
  id: string;
  position: GeoLocation;
  height: number;
  width: number;
  depth: number;
  color?: string;
}

export interface MaterialSettings {
  metalness: number;
  roughness: number;
  emissive: boolean;
  emissiveIntensity: number;
}

export interface PerformanceStats {
  fps: number;
  triangles: number;
  drawCalls: number;
  memory: number;
}

export interface ComparisonData {
  engine: RenderEngine;
  features: string[];
  pros: string[];
  cons: string[];
  performance: {
    averageFPS: number;
    loadTime: number;
    memoryUsage: number;
  };
}
