/**
 * Custom hook for managing scroll-based camera animation
 */

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { easeInOutCubic } from '../utilities/easingFunctions';
import { cameraKeyframes } from '../config/cameraKeyframes';

interface UseScrollAnimationProps {
  camera: THREE.PerspectiveCamera | null;
  houseModel: THREE.Group | null;
  isLoaded: boolean;
  onSectionChange: (section: number) => void;
  onProgressChange: (progress: number) => void;
}

export const useScrollAnimation = ({
  camera,
  houseModel,
  isLoaded,
  onSectionChange,
  onProgressChange
}: UseScrollAnimationProps) => {
  const scrollProgressRef = useRef(0);

  const handleScroll = useCallback(() => {
    if (!isLoaded || !camera) return;

    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const progress = Math.min(scrolled / scrollHeight, 1);
    scrollProgressRef.current = progress;
    onProgressChange(progress);

    // Calculate which keyframe section we're in
    const totalKeyframes = cameraKeyframes.length - 1;
    const exactPosition = progress * totalKeyframes;
    const currentKeyframe = Math.floor(exactPosition);
    const nextKeyframe = Math.min(currentKeyframe + 1, totalKeyframes);
    const localProgress = exactPosition - currentKeyframe;

    onSectionChange(currentKeyframe);

    // Smooth interpolation between keyframes
    const current = cameraKeyframes[currentKeyframe];
    const next = cameraKeyframes[nextKeyframe];

    const easedProgress = easeInOutCubic(localProgress);

    // Interpolate camera position
    camera.position.x = THREE.MathUtils.lerp(current.position[0], next.position[0], easedProgress);
    camera.position.y = THREE.MathUtils.lerp(current.position[1], next.position[1], easedProgress);
    camera.position.z = THREE.MathUtils.lerp(current.position[2], next.position[2], easedProgress);

    // Interpolate look-at point
    const lookAtTarget = new THREE.Vector3(
      THREE.MathUtils.lerp(current.lookAt[0], next.lookAt[0], easedProgress),
      THREE.MathUtils.lerp(current.lookAt[1], next.lookAt[1], easedProgress),
      THREE.MathUtils.lerp(current.lookAt[2], next.lookAt[2], easedProgress)
    );
    camera.lookAt(lookAtTarget);

    // Interpolate FOV for cinematic zoom effects
    const currentFov = current.fov || 50;
    const nextFov = next.fov || 50;
    camera.fov = THREE.MathUtils.lerp(currentFov, nextFov, easedProgress);
    camera.updateProjectionMatrix();

    // Subtle model rotation
    if (houseModel) {
      houseModel.rotation.y = progress * Math.PI * 0.2;
    }
  }, [isLoaded, camera, houseModel, onSectionChange, onProgressChange]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return scrollProgressRef;
};
