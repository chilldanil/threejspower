import { useState } from 'react';
import { ThreeJsScene } from './components/scenes/ThreeJsScene';
import { BabylonJsScene } from './components/scenes/BabylonJsScene';
import { ControlPanel } from './components/ui/ControlPanel';
import type {
  SceneConfig,
  LayerVisibility,
  MaterialSettings,
  PerformanceStats
} from './types';
import './App.css';

function App() {
  const [config, setConfig] = useState<SceneConfig>({
    engine: 'threejs',
    enableShadows: true,
    enablePostProcessing: false,
    enableHDR: false,
    cameraMode: 'orbit',
    ambientLightIntensity: 0.5,
    directionalLightIntensity: 1.5,
    pointLightIntensity: 2.0
  });

  const [layers, setLayers] = useState<LayerVisibility>({
    pointCloud: true,
    buildings: true,
    terrain: true,
    gisMap: false,
    models: true
  });

  const [materials, setMaterials] = useState<MaterialSettings>({
    metalness: 0.3,
    roughness: 0.7,
    emissive: false,
    emissiveIntensity: 0.5
  });

  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    triangles: 0,
    drawCalls: 0,
    memory: 0
  });

  const handleConfigChange = (newConfig: Partial<SceneConfig>) => {
    setConfig({ ...config, ...newConfig });
  };

  const handleLayerChange = (newLayers: Partial<LayerVisibility>) => {
    setLayers({ ...layers, ...newLayers });
  };

  const handleMaterialChange = (newMaterials: Partial<MaterialSettings>) => {
    setMaterials({ ...materials, ...newMaterials });
  };

  const handleStatsUpdate = (newStats: PerformanceStats) => {
    setStats(newStats);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Interactive 3D Web Platform</h1>
          <p className="subtitle">
            Advanced Rendering, GIS, and Point Cloud Integration
          </p>
        </div>
        <div className="engine-badge">
          <span className="badge-label">Active Engine:</span>
          <span className={`badge ${config.engine === 'threejs' ? 'threejs' : 'babylonjs'}`}>
            {config.engine === 'threejs' ? 'Three.js' : 'Babylon.js'}
          </span>
        </div>
      </header>

      <div className="scene-container">
        {config.engine === 'threejs' ? (
          <ThreeJsScene
            key="threejs"
            config={config}
            layers={layers}
            materials={materials}
            onStatsUpdate={handleStatsUpdate}
          />
        ) : (
          <BabylonJsScene
            key="babylonjs"
            config={config}
            layers={layers}
            materials={materials}
            onStatsUpdate={handleStatsUpdate}
          />
        )}
      </div>

      <ControlPanel
        config={config}
        layers={layers}
        materials={materials}
        stats={stats}
        onConfigChange={handleConfigChange}
        onLayerChange={handleLayerChange}
        onMaterialChange={handleMaterialChange}
      />

      <div className="info-panel">
        <h4>Navigation Controls</h4>
        <ul>
          <li><strong>Left Mouse:</strong> Rotate camera</li>
          <li><strong>Right Mouse:</strong> Pan camera</li>
          <li><strong>Scroll Wheel:</strong> Zoom in/out</li>
          <li><strong>Touch:</strong> Pinch to zoom, drag to rotate</li>
        </ul>
      </div>

      <footer className="app-footer">
        <div className="footer-content">
          <p>
            Demonstrating state-of-the-art web rendering with Three.js & Babylon.js
          </p>
          <p className="tech-stack">
            React • Vite • TypeScript • WebGL • Point Cloud • GIS Integration
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
