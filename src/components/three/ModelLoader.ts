/**
 * 3D Model loading module
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export interface ModelLoadCallbacks {
  onLoad?: (model: THREE.Group) => void;
  onProgress?: (progress: number) => void;
  onError?: (error: unknown) => void;
}

/**
 * Loads a GLTF model with Draco compression support
 */
export const loadModel = (
  modelPath: string,
  callbacks: ModelLoadCallbacks = {}
): void => {
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
  gltfLoader.setDRACOLoader(dracoLoader);

  gltfLoader.load(
    modelPath,
    (gltf) => {
      const houseModel = gltf.scene;

      // Center the model
      const box = new THREE.Box3().setFromObject(houseModel);
      const modelCenter = box.getCenter(new THREE.Vector3());

      houseModel.position.x = -modelCenter.x;
      houseModel.position.z = -modelCenter.z;
      houseModel.position.y = -box.min.y;

      // Enable shadows on all meshes
      houseModel.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      callbacks.onLoad?.(houseModel);
    },
    (progress) => {
      const percentComplete = (progress.loaded / progress.total) * 100;
      callbacks.onProgress?.(percentComplete);
    },
    (error) => {
      console.error('Error loading model:', error);
      callbacks.onError?.(error);
    }
  );
};
