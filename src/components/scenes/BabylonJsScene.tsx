import React, { useEffect, useRef } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  PointLight,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  ShadowGenerator,
  VertexData,
  PointsCloudSystem,
  Mesh,
} from '@babylonjs/core';
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

interface BabylonJsSceneProps {
  config: SceneConfig;
  layers: LayerVisibility;
  materials: MaterialSettings;
  onStatsUpdate: (stats: PerformanceStats) => void;
}

export const BabylonJsScene: React.FC<BabylonJsSceneProps> = ({
  config,
  layers,
  materials,
  onStatsUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  const engineRef = useRef<Engine | null>(null);
  const perfMonitorRef = useRef(new PerformanceMonitor());

  // References to scene objects
  const pointCloudMeshesRef = useRef<Mesh[]>([]);
  const buildingMeshesRef = useRef<Mesh[]>([]);
  const terrainMeshRef = useRef<Mesh | null>(null);
  const lightsRef = useRef<{
    hemispheric: HemisphericLight;
    directional: DirectionalLight;
    point: PointLight;
  } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize engine
    const engine = new Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true
    });
    engineRef.current = engine;

    // Initialize scene
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.1, 0.1, 0.18, 1.0);
    sceneRef.current = scene;

    // Initialize camera
    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 4,
      Math.PI / 3,
      80,
      new Vector3(0, 0, 0),
      scene
    );
    camera.attachControl(canvasRef.current, true);
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 300;
    camera.wheelPrecision = 50;

    // Initialize lights
    const hemisphericLight = new HemisphericLight(
      'hemispheric',
      new Vector3(0, 1, 0),
      scene
    );
    hemisphericLight.intensity = 0.5;

    const directionalLight = new DirectionalLight(
      'directional',
      new Vector3(-1, -2, -1),
      scene
    );
    directionalLight.position = new Vector3(50, 100, 50);
    directionalLight.intensity = 1.5;

    const pointLight = new PointLight(
      'point',
      new Vector3(0, 30, 0),
      scene
    );
    pointLight.intensity = 2;
    pointLight.diffuse = new Color3(0.29, 0.62, 1.0);

    lightsRef.current = {
      hemispheric: hemisphericLight,
      directional: directionalLight,
      point: pointLight
    };

    // Setup shadow generator
    const shadowGenerator = new ShadowGenerator(2048, directionalLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurScale = 2;

    // Create terrain
    createTerrain(scene);

    // Create buildings
    createBuildings(scene, shadowGenerator);

    // Create point clouds
    createPointClouds(scene);

    // Create ground grid
    const ground = MeshBuilder.CreateGround('ground', { width: 200, height: 200 }, scene);
    const groundMaterial = new StandardMaterial('groundMat', scene);
    groundMaterial.diffuseColor = new Color3(0.1, 0.1, 0.1);
    groundMaterial.specularColor = new Color3(0, 0, 0);
    ground.material = groundMaterial;
    ground.receiveShadows = true;
    ground.position.y = -6;

    // Animation loop
    let frameCount = 0;
    engine.runRenderLoop(() => {
      if (!scene) return;

      perfMonitorRef.current.update();

      // Animate point light
      if (lightsRef.current) {
        const time = Date.now() * 0.001;
        lightsRef.current.point.position.x = Math.sin(time) * 30;
        lightsRef.current.point.position.z = Math.cos(time) * 30;
      }

      scene.render();
      frameCount++;

      // Update stats every 30 frames
      if (frameCount % 30 === 0) {
        const stats = perfMonitorRef.current.getStats();
        stats.triangles = scene.getActiveMeshes().length * 1000; // Approximation
        stats.drawCalls = scene.getActiveMeshes().length;
        onStatsUpdate(stats);
      }
    });

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      engine.dispose();
    };
  }, []);

  // Update scene configuration
  useEffect(() => {
    if (!sceneRef.current) return;

    // Shadows are always enabled in Babylon.js for this demo
    // Post-processing and HDR would require additional setup
  }, [config.enableShadows, config.enablePostProcessing, config.enableHDR]);

  // Update lighting
  useEffect(() => {
    if (!lightsRef.current) return;
    lightsRef.current.hemispheric.intensity = config.ambientLightIntensity;
    lightsRef.current.directional.intensity = config.directionalLightIntensity;
    lightsRef.current.point.intensity = config.pointLightIntensity;
  }, [config.ambientLightIntensity, config.directionalLightIntensity, config.pointLightIntensity]);

  // Update layer visibility
  useEffect(() => {
    pointCloudMeshesRef.current.forEach(mesh => {
      mesh.setEnabled(layers.pointCloud);
    });
    buildingMeshesRef.current.forEach(mesh => {
      mesh.setEnabled(layers.buildings);
    });
    if (terrainMeshRef.current) {
      terrainMeshRef.current.setEnabled(layers.terrain);
    }
  }, [layers]);

  // Update materials
  useEffect(() => {
    buildingMeshesRef.current.forEach(mesh => {
      const material = mesh.material as StandardMaterial;
      if (material) {
        material.roughness = materials.roughness;
        if (materials.emissive) {
          material.emissiveColor = new Color3(0.29, 0.62, 1.0);
        } else {
          material.emissiveColor = new Color3(0, 0, 0);
        }
      }
    });
  }, [materials]);

  const createTerrain = (scene: Scene) => {
    const terrainData = generateTerrainData(200, 200, 50);

    const terrain = new Mesh('terrain', scene);
    const vertexData = new VertexData();

    vertexData.positions = Array.from(terrainData.vertices);
    vertexData.indices = Array.from(terrainData.indices);
    vertexData.normals = Array.from(terrainData.normals);

    vertexData.applyToMesh(terrain);

    const material = new StandardMaterial('terrainMat', scene);
    material.diffuseColor = new Color3(0.23, 0.37, 0.23);
    material.specularColor = new Color3(0.1, 0.1, 0.1);
    terrain.material = material;
    terrain.receiveShadows = true;
    terrain.position.y = -5;

    terrainMeshRef.current = terrain;
  };

  const createBuildings = (scene: Scene, shadowGenerator: ShadowGenerator) => {
    const buildings = generateSampleBuildings(20);

    buildings.forEach((building) => {
      const [x, _y, z] = geoToLocal(building.position);

      const box = MeshBuilder.CreateBox(
        building.id,
        {
          width: building.width,
          height: building.height,
          depth: building.depth
        },
        scene
      );

      box.position = new Vector3(x, building.height / 2, z);

      const material = new StandardMaterial(`${building.id}-mat`, scene);
      const colorHex = building.color || '#8899aa';
      const r = parseInt(colorHex.slice(1, 3), 16) / 255;
      const g = parseInt(colorHex.slice(3, 5), 16) / 255;
      const b = parseInt(colorHex.slice(5, 7), 16) / 255;

      material.diffuseColor = new Color3(r, g, b);
      material.specularColor = new Color3(0.5, 0.5, 0.5);
      box.material = material;

      shadowGenerator.addShadowCaster(box);
      box.receiveShadows = true;

      buildingMeshesRef.current.push(box);
    });
  };

  const createPointClouds = (scene: Scene) => {
    // Create building point cloud
    const buildingCloud = generateSamplePointCloud('building', 50000);
    const buildingPCS = new PointsCloudSystem('buildingPCS', 1, scene);

    buildingPCS.addPoints(buildingCloud.count, (particle: any, i: number) => {
      particle.position = new Vector3(
        buildingCloud.positions[i * 3] - 60,
        buildingCloud.positions[i * 3 + 1],
        buildingCloud.positions[i * 3 + 2]
      );
      particle.color = new Color4(
        buildingCloud.colors[i * 3],
        buildingCloud.colors[i * 3 + 1],
        buildingCloud.colors[i * 3 + 2],
        1.0
      );
    });

    buildingPCS.buildMeshAsync().then(() => {
      if (buildingPCS.mesh) {
        pointCloudMeshesRef.current.push(buildingPCS.mesh);
      }
    });

    // Create terrain point cloud
    const terrainCloud = generateSamplePointCloud('terrain', 30000);
    const terrainPCS = new PointsCloudSystem('terrainPCS', 1, scene);

    terrainPCS.addPoints(terrainCloud.count, (particle: any, i: number) => {
      particle.position = new Vector3(
        terrainCloud.positions[i * 3] + 60,
        terrainCloud.positions[i * 3 + 1],
        terrainCloud.positions[i * 3 + 2]
      );
      particle.color = new Color4(
        terrainCloud.colors[i * 3],
        terrainCloud.colors[i * 3 + 1],
        terrainCloud.colors[i * 3 + 2],
        1.0
      );
    });

    terrainPCS.buildMeshAsync().then(() => {
      if (terrainPCS.mesh) {
        pointCloudMeshesRef.current.push(terrainPCS.mesh);
      }
    });
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', outline: 'none' }}
    />
  );
};
