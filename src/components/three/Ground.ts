/**
 * Ground and grid module
 */

import * as THREE from 'three';

/**
 * Creates the ground plane
 */
export const createGround = (): THREE.Mesh => {
  const groundGeometry = new THREE.CircleGeometry(100, 64);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.9,
    metalness: 0.1,
    emissive: 0x0a0a15,
    emissiveIntensity: 0.2
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;

  return ground;
};

/**
 * Creates the grid helper
 */
export const createGrid = (): THREE.GridHelper => {
  const gridHelper = new THREE.GridHelper(100, 50, 0x4a9eff, 0x2a2a3e);
  gridHelper.material.opacity = 0.15;
  gridHelper.material.transparent = true;

  return gridHelper;
};
