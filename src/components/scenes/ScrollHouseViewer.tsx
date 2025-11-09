/**
 * ScrollHouseViewer - Main orchestrator component
 * Coordinates all Three.js modules and UI components
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Types
import type { ScrollHouseViewerProps, WeatherCondition } from '../../types/three';

// Configuration
import { cameraKeyframes } from '../../config/cameraKeyframes';
import { getSkyColors } from '../../config/skyColorConfig';

// Hooks
import { useSunPosition } from '../../hooks/useSunPosition';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

// Three.js modules
import {
  createSkyBackground,
  createSun,
  createMoon,
  createStars,
  updateSun,
  updateMoon
} from '../three/Sky';
import { createLights, updateLights, type SceneLights } from '../three/Lighting';
import {
  createClouds,
  createRain,
  animateClouds,
  animateRain,
  removeClouds
} from '../three/Weather';
import { loadModel } from '../three/ModelLoader';
import { createGround, createGrid } from '../three/Ground';

// UI Components
import { LoadingOverlay } from '../ui/LoadingOverlay';
import { ProgressBar } from '../ui/ProgressBar';
import { ScrollIndicator } from '../ui/ScrollIndicator';
import { SectionIndicators } from '../ui/SectionIndicators';
import { InfoPanel } from '../ui/InfoPanel';
import { ScrollSections } from '../ui/ScrollSections';

export const ScrollHouseViewer: React.FC<ScrollHouseViewerProps> = ({
  modelPath = '/models/haus.glb',
  latitude = 48.1502953252508,
  longitude = 11.567239067279655,
  testMode: externalTestMode = false,
  testTime: externalTestTime,
  testWeather: externalTestWeather
}) => {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const houseModelRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  // State
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(externalTestTime || new Date());
  const [weather] = useState<WeatherCondition>(
    externalTestWeather || { type: 'clear', intensity: 0.7 }
  );

  // Refs for Three.js objects
  const lightsRef = useRef<SceneLights | null>(null);
  const sunObjectsRef = useRef<ReturnType<typeof createSun> | null>(null);
  const moonObjectsRef = useRef<ReturnType<typeof createMoon> | null>(null);
  const starsObjectsRef = useRef<ReturnType<typeof createStars> | null>(null);
  const cloudsRef = useRef<THREE.Mesh[]>([]);
  const rainObjectsRef = useRef<ReturnType<typeof createRain> | null>(null);
  const lastWeatherTypeRef = useRef<string>(externalTestWeather?.type || 'clear');

  // Use external test values if provided
  const activeTime = externalTestMode && externalTestTime ? externalTestTime : currentTime;
  const activeWeather = externalTestMode && externalTestWeather ? externalTestWeather : weather;

  // Custom hooks
  const { sunPosition, moonPosition, isNight, isDay } = useSunPosition(
    activeTime,
    latitude,
    longitude
  );

  const scrollProgressRef = useScrollAnimation({
    camera: cameraRef.current,
    houseModel: houseModelRef.current,
    isLoaded,
    onSectionChange: setCurrentSection,
    onProgressChange: setScrollProgress
  });

  // Separate effect to update scene when test props change
  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current) return;

    const scene = sceneRef.current;
    const currentSunPos = sunPosition;
    const currentMoonPos = moonPosition;
    const currentSkyColors = getSkyColors(currentSunPos.altitude, activeWeather);

    // Update sky background
    createSkyBackground(scene, currentSkyColors);

    // Update celestial objects
    if (sunObjectsRef.current) {
      updateSun(
        sunObjectsRef.current.sunSphere,
        sunObjectsRef.current.sunGlow,
        sunObjectsRef.current.sunMaterial,
        sunObjectsRef.current.sunGlowMaterial,
        currentSunPos,
        currentSkyColors,
        isDay
      );
    }

    if (moonObjectsRef.current) {
      updateMoon(
        moonObjectsRef.current.moonSphere,
        moonObjectsRef.current.moonGlow,
        currentMoonPos,
        isNight
      );
    }

    if (starsObjectsRef.current) {
      starsObjectsRef.current.starsMaterial.opacity = isNight
        ? Math.min(1, (Math.abs(currentSunPos.altitude) - 0.1) / 0.5)
        : 0;
    }

    // Update lights
    if (lightsRef.current) {
      updateLights(
        lightsRef.current,
        currentSunPos,
        currentMoonPos,
        currentSkyColors,
        isDay,
        isNight
      );
    }

    // Update renderer exposure
    rendererRef.current.toneMappingExposure = currentSkyColors.exposure;
  }, [sunPosition, moonPosition, activeWeather, isDay, isNight]);

  // Effect to handle weather changes
  useEffect(() => {
    if (!sceneRef.current) return;

    // Recreate clouds when weather changes
    if (lastWeatherTypeRef.current !== activeWeather.type) {
      lastWeatherTypeRef.current = activeWeather.type;

      if (sceneRef.current && cloudsRef.current.length > 0) {
        removeClouds(sceneRef.current, cloudsRef.current);
        cloudsRef.current = createClouds(sceneRef.current, activeWeather.type);
      }

      // Update rain visibility
      if (rainObjectsRef.current) {
        rainObjectsRef.current.rainMaterial.opacity =
          activeWeather.type === 'rainy' ? 0.6 : 0;
      }
    }
  }, [activeWeather.type]);

  // Main Three.js scene setup effect
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Get initial sky colors
    const skyColors = getSkyColors(sunPosition.altitude, activeWeather);

    // Setup sky background
    createSkyBackground(scene, skyColors);

    // Create celestial objects
    const sunObjects = createSun(sunPosition, skyColors);
    scene.add(sunObjects.sunSphere);
    scene.add(sunObjects.sunGlow);
    sunObjectsRef.current = sunObjects;

    const moonObjects = createMoon(moonPosition, sunPosition.altitude);
    scene.add(moonObjects.moonSphere);
    scene.add(moonObjects.moonGlow);
    moonObjectsRef.current = moonObjects;

    const starsObjects = createStars(sunPosition.altitude);
    scene.add(starsObjects.stars);
    starsObjectsRef.current = starsObjects;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(...cameraKeyframes[0].position);
    camera.lookAt(...cameraKeyframes[0].lookAt);
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = skyColors.exposure;
    rendererRef.current = renderer;

    // Create lights
    const lights = createLights(sunPosition, moonPosition, skyColors);
    scene.add(lights.ambientLight);
    scene.add(lights.sunLight);
    scene.add(lights.skyLight);
    scene.add(lights.hemiLight);
    scene.add(lights.moonLight);
    lightsRef.current = lights;

    // Create ground and grid
    const ground = createGround();
    scene.add(ground);

    const grid = createGrid();
    scene.add(grid);

    // Create weather effects
    const clouds = createClouds(scene, activeWeather.type);
    cloudsRef.current = clouds;

    const rainObjects = createRain(activeWeather.type === 'rainy');
    scene.add(rainObjects.rain);
    rainObjectsRef.current = rainObjects;

    // Load 3D model
    loadModel(modelPath, {
      onLoad: (model) => {
        houseModelRef.current = model;
        scene.add(model);
        setIsLoaded(true);
      },
      onProgress: (progress) => {
        setLoadingProgress(progress);
      },
      onError: (error) => {
        console.error('Error loading model:', error);
      }
    });

    // Animation loop
    let animationId: number;
    let lastTimeUpdate = Date.now();
    const timeUpdateInterval = 60000; // 1 minute

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const now = Date.now();
      const time = now * 0.0003;

      // Update time - skip if external test mode is active
      if (!externalTestMode || !externalTestTime) {
        const shouldUpdateTime = (now - lastTimeUpdate > timeUpdateInterval);
        if (shouldUpdateTime) {
          lastTimeUpdate = now;
          const newTime = new Date();
          setCurrentTime(newTime);
        }
      }

      // Animate house model (subtle breathing)
      if (houseModelRef.current) {
        houseModelRef.current.position.y = Math.sin(time) * 0.05;
      }

      // Animate clouds
      animateClouds(cloudsRef.current, time);

      // Animate rain
      if (rainObjectsRef.current) {
        animateRain(
          rainObjectsRef.current.rain.geometry,
          rainObjectsRef.current.rainVelocities,
          rainObjectsRef.current.rainMaterial
        );
      }

      // Animate stars with current sun position
      if (starsObjectsRef.current) {
        // Get current sun position for star animation
        const currentSunAltitude = sunPosition.altitude;
        const currentIsNight = currentSunAltitude < -0.1;

        if (currentIsNight) {
          const opacity = Math.min(1, (Math.abs(currentSunAltitude) - 0.1) / 0.5);
          starsObjectsRef.current.starsMaterial.opacity = opacity;

          // Twinkle effect
          const twinkle = (Math.sin(time * 5) + 1) * 0.05;
          starsObjectsRef.current.starsMaterial.size = 0.5 + twinkle;
        } else {
          starsObjectsRef.current.starsMaterial.opacity = 0;
        }
      }

      // Subtle camera shake
      if (cameraRef.current) {
        cameraRef.current.position.x += Math.sin(time * 2) * 0.005;
        cameraRef.current.position.y += Math.cos(time * 3) * 0.004;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [isLoaded, modelPath]);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Fixed canvas */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0
        }}
      >
        <canvas ref={canvasRef} />
      </div>

      {/* Loading overlay */}
      {!isLoaded && <LoadingOverlay progress={loadingProgress} />}

      {/* UI Components - only show when loaded */}
      {isLoaded && (
        <>
          <ScrollSections
            keyframes={cameraKeyframes}
            currentSection={currentSection}
            scrollProgress={scrollProgressRef.current}
          />

          <ScrollIndicator visible={scrollProgress < 0.08} />

          <ProgressBar progress={scrollProgress} />

          <SectionIndicators
            sectionCount={cameraKeyframes.length}
            currentSection={currentSection}
          />

          <InfoPanel
            currentTime={activeTime}
            weather={activeWeather}
            sunAltitude={sunPosition.altitude}
          />
        </>
      )}
    </div>
  );
};
