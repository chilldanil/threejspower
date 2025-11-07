import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import type {
  SceneConfig,
  LayerVisibility,
  MaterialSettings,
  PerformanceStats
} from '../../types';
import {
  generateSamplePointCloud,
  generateSampleBuildings,
  generateTerrainData
} from '../../utils/sampleDataGenerator';
import { geoToLocal } from '../../utils/coordinateSystem';
import { PerformanceMonitor } from '../../utils/performanceMonitor';

interface ThreeJsSceneProps {
  config: SceneConfig;
  layers: LayerVisibility;
  materials: MaterialSettings;
  onStatsUpdate: (stats: PerformanceStats) => void;
}

export const ThreeJsScene: React.FC<ThreeJsSceneProps> = ({
  config,
  layers,
  materials,
  onStatsUpdate
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const perfMonitorRef = useRef(new PerformanceMonitor());

  // References to scene objects for layer toggling
  const pointCloudGroupRef = useRef<THREE.Group>(new THREE.Group());
  const buildingsGroupRef = useRef<THREE.Group>(new THREE.Group());
  const terrainGroupRef = useRef<THREE.Group>(new THREE.Group());
  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    directional: THREE.DirectionalLight;
    point: THREE.PointLight;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    scene.fog = new THREE.Fog(0x1a1a2e, 100, 500);
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(50, 50, 50);
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Initialize controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 300;
    controls.minDistance = 5;
    controlsRef.current = controls;

    // Initialize post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,
      0.4,
      0.85
    );
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // Setup lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4a9eff, 2, 100);
    pointLight.position.set(0, 30, 0);
    scene.add(pointLight);

    lightsRef.current = { ambient: ambientLight, directional: directionalLight, point: pointLight };

    // Create groups for different layers
    scene.add(pointCloudGroupRef.current);
    scene.add(buildingsGroupRef.current);
    scene.add(terrainGroupRef.current);

    // Generate and add terrain
    createTerrain();

    // Generate and add buildings
    createBuildings();

    // Generate and add point clouds
    createPointClouds();

    // Add grid helper
    const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      controls.update();
      perfMonitorRef.current.update();

      // Update point light animation
      if (lightsRef.current) {
        const time = Date.now() * 0.001;
        lightsRef.current.point.position.x = Math.sin(time) * 30;
        lightsRef.current.point.position.z = Math.cos(time) * 30;
      }

      if (config.enablePostProcessing && composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }

      // Update stats
      const stats = perfMonitorRef.current.getStats();
      stats.triangles = renderer.info.render.triangles;
      stats.drawCalls = renderer.info.render.calls;
      onStatsUpdate(stats);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      if (composerRef.current) {
        composerRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update scene configuration
  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.shadowMap.enabled = config.enableShadows;
  }, [config.enableShadows]);

  // Update lighting
  useEffect(() => {
    if (!lightsRef.current) return;
    lightsRef.current.ambient.intensity = config.ambientLightIntensity;
    lightsRef.current.directional.intensity = config.directionalLightIntensity;
    lightsRef.current.point.intensity = config.pointLightIntensity;
  }, [config.ambientLightIntensity, config.directionalLightIntensity, config.pointLightIntensity]);

  // Update layer visibility
  useEffect(() => {
    pointCloudGroupRef.current.visible = layers.pointCloud;
    buildingsGroupRef.current.visible = layers.buildings;
    terrainGroupRef.current.visible = layers.terrain;
  }, [layers]);

  // Update materials
  useEffect(() => {
    buildingsGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.metalness = materials.metalness;
        child.material.roughness = materials.roughness;
        if (materials.emissive) {
          child.material.emissive = new THREE.Color(0x4a9eff);
          child.material.emissiveIntensity = materials.emissiveIntensity;
        } else {
          child.material.emissive = new THREE.Color(0x000000);
          child.material.emissiveIntensity = 0;
        }
      }
    });
  }, [materials]);

  const createTerrain = () => {
    const terrainData = generateTerrainData(200, 200, 50);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(terrainData.vertices, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(terrainData.normals, 3));
    geometry.setIndex(new THREE.BufferAttribute(terrainData.indices, 1));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0x3a5f3a,
      roughness: 0.8,
      metalness: 0.2
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.receiveShadow = true;
    terrain.position.y = -5;
    terrainGroupRef.current.add(terrain);
  };

  const createBuildings = () => {
    const buildings = generateSampleBuildings(20);

    buildings.forEach((building) => {
      const [x, _y, z] = geoToLocal(building.position);

      const geometry = new THREE.BoxGeometry(building.width, building.height, building.depth);
      const material = new THREE.MeshStandardMaterial({
        color: building.color,
        roughness: 0.7,
        metalness: 0.3
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, building.height / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      buildingsGroupRef.current.add(mesh);
    });
  };

  const createPointClouds = () => {
    // Create building point cloud
    const buildingCloud = generateSamplePointCloud('building', 50000);
    const buildingGeometry = new THREE.BufferGeometry();
    buildingGeometry.setAttribute('position', new THREE.BufferAttribute(buildingCloud.positions, 3));
    buildingGeometry.setAttribute('color', new THREE.BufferAttribute(buildingCloud.colors, 3));

    const buildingMaterial = new THREE.PointsMaterial({
      size: 0.3,
      vertexColors: true,
      sizeAttenuation: true
    });

    const buildingPoints = new THREE.Points(buildingGeometry, buildingMaterial);
    buildingPoints.position.set(-60, 0, 0);
    pointCloudGroupRef.current.add(buildingPoints);

    // Create terrain point cloud
    const terrainCloud = generateSamplePointCloud('terrain', 30000);
    const terrainGeometry = new THREE.BufferGeometry();
    terrainGeometry.setAttribute('position', new THREE.BufferAttribute(terrainCloud.positions, 3));
    terrainGeometry.setAttribute('color', new THREE.BufferAttribute(terrainCloud.colors, 3));

    const terrainMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      sizeAttenuation: true
    });

    const terrainPoints = new THREE.Points(terrainGeometry, terrainMaterial);
    terrainPoints.position.set(60, 0, 0);
    pointCloudGroupRef.current.add(terrainPoints);
  };

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};
