/**
 * Camera keyframes configuration for cinematic scroll animation
 */

import type { CameraKeyframe } from '../types/three';

export const cameraKeyframes: CameraKeyframe[] = [
  {
    position: [40, 25, 40],
    lookAt: [0, 8, 0],
    fov: 55,
    label: 'First Impressions',
    description: 'Where architecture meets imagination. Every great journey begins with a single view.'
  },
  {
    position: [30, 12, 15],
    lookAt: [0, 6, 0],
    fov: 48,
    label: 'Approaching',
    description: 'Drawing closer, the details begin to reveal themselves. Form and function in perfect harmony.'
  },
  {
    position: [20, 8, -5],
    lookAt: [0, 7, 0],
    fov: 42,
    label: 'Main Entrance',
    description: 'The threshold of possibility. Modern lines frame the entrance, inviting you to explore.'
  },
  {
    position: [-15, 10, 15],
    lookAt: [0, 8, 0],
    fov: 50,
    label: 'Left Profile',
    description: 'Sculptural elements catch the light. Each angle reveals new dimensions of design.'
  },
  {
    position: [0, 18, 30],
    lookAt: [0, 6, 0],
    fov: 52,
    label: 'Rear Perspective',
    description: 'Seamless integration with the environment. Architecture that breathes with its surroundings.'
  },
  {
    position: [25, 6, 0],
    lookAt: [-5, 8, 0],
    fov: 38,
    label: 'Close Detail',
    description: 'Precision in every edge. Material choices that speak to quality and craftsmanship.'
  },
  {
    position: [15, 14, -25],
    lookAt: [0, 7, 0],
    fov: 46,
    label: 'Right Elevation',
    description: 'Symmetry balanced with surprise. Windows frame views and bring the outside in.'
  },
  {
    position: [-25, 16, -20],
    lookAt: [0, 5, 0],
    fov: 50,
    label: 'Corner Composition',
    description: 'Where two facades meet, creating dynamic interplay of light and shadow.'
  },
  {
    position: [0, 35, 20],
    lookAt: [0, 0, 0],
    fov: 60,
    label: 'From Above',
    description: 'The complete vision revealed. Roof design and spatial relationships in context.'
  },
  {
    position: [8, 4, 18],
    lookAt: [0, 6, 0],
    fov: 35,
    label: 'Human Scale',
    description: 'At eye level, feeling the proportions. This is where architecture becomes experience.'
  },
  {
    position: [-30, 20, 25],
    lookAt: [0, 8, 0],
    fov: 48,
    label: 'Golden Hour',
    description: 'As light shifts, surfaces transform. Architecture designed for every moment of the day.'
  },
  {
    position: [35, 28, 0],
    lookAt: [0, 5, 0],
    fov: 58,
    label: 'Final Farewell',
    description: 'A lasting impression. This is more than a house—it\'s a vision realized.'
  }
];
