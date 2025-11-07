import { useState } from 'react';
import { ThreeJsScene } from './components/scenes/ThreeJsScene';
import { BabylonJsScene } from './components/scenes/BabylonJsScene';
import { HouseViewer } from './components/scenes/HouseViewer';
import { ScrollHouseViewer } from './components/scenes/ScrollHouseViewer';
import { ControlPanel } from './components/ui/ControlPanel';
import type {
  SceneConfig,
  LayerVisibility,
  MaterialSettings,
  PerformanceStats,
  ViewMode
} from './types';
import './App.css';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('landing');
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

  // Render landing page with exit button
  if (viewMode === 'landing') {
    return (
      <div style={{ position: 'relative' }}>
        <ScrollHouseViewer />
        {/* Floating navigation button */}
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 2000,
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={() => setViewMode('demo')}
            style={{
              padding: '12px 24px',
              background: 'rgba(74, 158, 255, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(74, 158, 255, 1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(74, 158, 255, 0.9)'}
          >
            🏙️ Explore Demo
          </button>
          <button
            onClick={() => setViewMode('house')}
            style={{
              padding: '12px 24px',
              background: 'rgba(139, 195, 74, 0.9)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(139, 195, 74, 1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(139, 195, 74, 0.9)'}
          >
            🏠 House Viewer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Interactive 3D Web Platform</h1>
          <p className="subtitle">
            {viewMode === 'house'
              ? 'Architectural Visualization - House Flythrough'
              : 'Advanced Rendering, GIS, and Point Cloud Integration'
            }
          </p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          {/* View Mode Selector */}
          <div className="view-selector">
            <button
              onClick={() => setViewMode('landing')}
            >
              ✨ Landing Page
            </button>
            <button
              className={viewMode === 'demo' ? 'active' : ''}
              onClick={() => setViewMode('demo')}
            >
              🏙️ Demo Scene
            </button>
            <button
              className={viewMode === 'house' ? 'active' : ''}
              onClick={() => setViewMode('house')}
            >
              🏠 House Viewer
            </button>
          </div>

          {/* Engine badge - only show in demo mode */}
          {viewMode === 'demo' && (
            <div className="engine-badge">
              <span className="badge-label">Engine:</span>
              <span className={`badge ${config.engine === 'threejs' ? 'threejs' : 'babylonjs'}`}>
                {config.engine === 'threejs' ? 'Three.js' : 'Babylon.js'}
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="scene-container">
        {viewMode === 'house' ? (
          <HouseViewer
            key="house-viewer"
            enableShadows={true}
            enableSSAO={true}
            enableBloom={false}
          />
        ) : config.engine === 'threejs' ? (
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

      {/* Only show control panel in demo mode */}
      {viewMode === 'demo' && (
        <>
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
        </>
      )}

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
