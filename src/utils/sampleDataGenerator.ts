// Generate sample data for demonstration purposes

import type { PointCloudData, CityBuilding } from '../types';
import { getReferencePoint } from './coordinateSystem';

/**
 * Generate a sample point cloud representing a building or terrain
 */
export function generateSamplePointCloud(
  type: 'building' | 'terrain' | 'street' = 'building',
  density: number = 10000
): PointCloudData {
  const positions = new Float32Array(density * 3);
  const colors = new Float32Array(density * 3);
  const intensities = new Float32Array(density);
  const classifications = new Uint8Array(density);

  for (let i = 0; i < density; i++) {
    const i3 = i * 3;

    if (type === 'building') {
      // Create a building-like point cloud
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 20 + 10;
      const height = Math.random() * 50;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;

      // Color gradient based on height
      const heightFactor = height / 50;
      colors[i3] = 0.7 + heightFactor * 0.3;
      colors[i3 + 1] = 0.6 + heightFactor * 0.2;
      colors[i3 + 2] = 0.5 + heightFactor * 0.1;

      classifications[i] = 6; // Building class
    } else if (type === 'terrain') {
      // Create terrain-like point cloud with noise
      const x = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      const y = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5 + Math.random() * 2;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Ground colors (green/brown)
      colors[i3] = 0.3 + Math.random() * 0.2;
      colors[i3 + 1] = 0.5 + Math.random() * 0.3;
      colors[i3 + 2] = 0.2 + Math.random() * 0.1;

      classifications[i] = 2; // Ground class
    } else {
      // Street/road
      const x = (Math.random() - 0.5) * 100;
      const z = Math.random() * 100;
      const y = Math.random() * 0.5;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Gray colors for roads
      const gray = 0.3 + Math.random() * 0.2;
      colors[i3] = gray;
      colors[i3 + 1] = gray;
      colors[i3 + 2] = gray;

      classifications[i] = 9; // Road class
    }

    intensities[i] = Math.random();
  }

  return {
    positions,
    colors,
    intensities,
    classifications,
    count: density
  };
}

/**
 * Generate sample city buildings
 */
export function generateSampleBuildings(count: number = 20): CityBuilding[] {
  const buildings: CityBuilding[] = [];
  const reference = getReferencePoint();

  const colors = [
    '#8899aa', '#aabbcc', '#ccddee', '#667788', '#445566',
    '#9999aa', '#bbbbcc', '#888899', '#6677aa', '#5566aa'
  ];

  for (let i = 0; i < count; i++) {
    // Generate buildings in a grid pattern around the reference point
    const offsetLat = (Math.random() - 0.5) * 0.02; // ~2km range
    const offsetLon = (Math.random() - 0.5) * 0.02;

    buildings.push({
      id: `building-${i}`,
      position: {
        latitude: reference.latitude + offsetLat,
        longitude: reference.longitude + offsetLon,
        altitude: 0
      },
      height: 20 + Math.random() * 80,
      width: 10 + Math.random() * 20,
      depth: 10 + Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  return buildings;
}

/**
 * Generate sample GeoJSON data for demonstration
 */
export function generateSampleGeoJSON() {
  const reference = getReferencePoint();

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'Demo Area',
          type: 'boundary'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [reference.longitude - 0.01, reference.latitude - 0.01],
            [reference.longitude + 0.01, reference.latitude - 0.01],
            [reference.longitude + 0.01, reference.latitude + 0.01],
            [reference.longitude - 0.01, reference.latitude + 0.01],
            [reference.longitude - 0.01, reference.latitude - 0.01]
          ]]
        }
      },
      {
        type: 'Feature',
        properties: {
          name: 'Main Street',
          type: 'road'
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [reference.longitude - 0.005, reference.latitude],
            [reference.longitude + 0.005, reference.latitude]
          ]
        }
      }
    ]
  };
}

/**
 * Generate terrain mesh data
 */
export function generateTerrainData(
  width: number = 200,
  height: number = 200,
  resolution: number = 50
): { vertices: Float32Array; indices: Uint32Array; normals: Float32Array } {
  const vertices: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];

  const stepX = width / resolution;
  const stepZ = height / resolution;

  // Generate vertices
  for (let z = 0; z <= resolution; z++) {
    for (let x = 0; x <= resolution; x++) {
      const posX = -width / 2 + x * stepX;
      const posZ = -height / 2 + z * stepZ;
      const posY = Math.sin(posX * 0.1) * Math.cos(posZ * 0.1) * 5;

      vertices.push(posX, posY, posZ);

      // Simple normal calculation (pointing up with slight variation)
      normals.push(0, 1, 0);
    }
  }

  // Generate indices
  for (let z = 0; z < resolution; z++) {
    for (let x = 0; x < resolution; x++) {
      const topLeft = z * (resolution + 1) + x;
      const topRight = topLeft + 1;
      const bottomLeft = (z + 1) * (resolution + 1) + x;
      const bottomRight = bottomLeft + 1;

      indices.push(topLeft, bottomLeft, topRight);
      indices.push(topRight, bottomLeft, bottomRight);
    }
  }

  return {
    vertices: new Float32Array(vertices),
    indices: new Uint32Array(indices),
    normals: new Float32Array(normals)
  };
}
