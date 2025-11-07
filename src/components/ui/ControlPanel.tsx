import React from 'react';
import type {
  CameraMode,
  SceneConfig,
  LayerVisibility,
  MaterialSettings,
  PerformanceStats
} from '../../types';
import './ControlPanel.css';

interface ControlPanelProps {
  config: SceneConfig;
  layers: LayerVisibility;
  materials: MaterialSettings;
  stats: PerformanceStats;
  onConfigChange: (config: Partial<SceneConfig>) => void;
  onLayerChange: (layers: Partial<LayerVisibility>) => void;
  onMaterialChange: (materials: Partial<MaterialSettings>) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  layers,
  materials,
  stats,
  onConfigChange,
  onLayerChange,
  onMaterialChange
}) => {
  return (
    <div className="control-panel">
      <div className="panel-section">
        <h3>Rendering Engine</h3>
        <div className="engine-toggle">
          <button
            className={config.engine === 'threejs' ? 'active' : ''}
            onClick={() => onConfigChange({ engine: 'threejs' })}
          >
            Three.js
          </button>
          <button
            className={config.engine === 'babylonjs' ? 'active' : ''}
            onClick={() => onConfigChange({ engine: 'babylonjs' })}
          >
            Babylon.js
          </button>
        </div>
      </div>

      <div className="panel-section">
        <h3>Camera Mode</h3>
        <select
          value={config.cameraMode}
          onChange={(e) => onConfigChange({ cameraMode: e.target.value as CameraMode })}
        >
          <option value="orbit">Orbit</option>
          <option value="free-fly">Free Fly</option>
          <option value="first-person">First Person</option>
        </select>
      </div>

      <div className="panel-section">
        <h3>Layers</h3>
        <label>
          <input
            type="checkbox"
            checked={layers.pointCloud}
            onChange={(e) => onLayerChange({ pointCloud: e.target.checked })}
          />
          Point Cloud
        </label>
        <label>
          <input
            type="checkbox"
            checked={layers.buildings}
            onChange={(e) => onLayerChange({ buildings: e.target.checked })}
          />
          Buildings
        </label>
        <label>
          <input
            type="checkbox"
            checked={layers.terrain}
            onChange={(e) => onLayerChange({ terrain: e.target.checked })}
          />
          Terrain
        </label>
        <label>
          <input
            type="checkbox"
            checked={layers.gisMap}
            onChange={(e) => onLayerChange({ gisMap: e.target.checked })}
          />
          GIS Map
        </label>
        <label>
          <input
            type="checkbox"
            checked={layers.models}
            onChange={(e) => onLayerChange({ models: e.target.checked })}
          />
          3D Models
        </label>
      </div>

      <div className="panel-section">
        <h3>Lighting</h3>
        <label>
          Ambient Light
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.ambientLightIntensity}
            onChange={(e) => onConfigChange({ ambientLightIntensity: parseFloat(e.target.value) })}
          />
          <span>{config.ambientLightIntensity.toFixed(1)}</span>
        </label>
        <label>
          Directional Light
          <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            value={config.directionalLightIntensity}
            onChange={(e) => onConfigChange({ directionalLightIntensity: parseFloat(e.target.value) })}
          />
          <span>{config.directionalLightIntensity.toFixed(1)}</span>
        </label>
        <label>
          Point Light
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={config.pointLightIntensity}
            onChange={(e) => onConfigChange({ pointLightIntensity: parseFloat(e.target.value) })}
          />
          <span>{config.pointLightIntensity.toFixed(1)}</span>
        </label>
      </div>

      <div className="panel-section">
        <h3>Materials (PBR)</h3>
        <label>
          Metalness
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={materials.metalness}
            onChange={(e) => onMaterialChange({ metalness: parseFloat(e.target.value) })}
          />
          <span>{materials.metalness.toFixed(2)}</span>
        </label>
        <label>
          Roughness
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={materials.roughness}
            onChange={(e) => onMaterialChange({ roughness: parseFloat(e.target.value) })}
          />
          <span>{materials.roughness.toFixed(2)}</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={materials.emissive}
            onChange={(e) => onMaterialChange({ emissive: e.target.checked })}
          />
          Emissive
        </label>
        {materials.emissive && (
          <label>
            Emissive Intensity
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={materials.emissiveIntensity}
              onChange={(e) => onMaterialChange({ emissiveIntensity: parseFloat(e.target.value) })}
            />
            <span>{materials.emissiveIntensity.toFixed(1)}</span>
          </label>
        )}
      </div>

      <div className="panel-section">
        <h3>Effects</h3>
        <label>
          <input
            type="checkbox"
            checked={config.enableShadows}
            onChange={(e) => onConfigChange({ enableShadows: e.target.checked })}
          />
          Shadows
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.enablePostProcessing}
            onChange={(e) => onConfigChange({ enablePostProcessing: e.target.checked })}
          />
          Post Processing
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.enableHDR}
            onChange={(e) => onConfigChange({ enableHDR: e.target.checked })}
          />
          HDR Lighting
        </label>
      </div>

      <div className="panel-section stats">
        <h3>Performance</h3>
        <div className="stat-line">
          <span>FPS:</span>
          <span className={stats.fps < 30 ? 'warning' : ''}>{stats.fps}</span>
        </div>
        <div className="stat-line">
          <span>Triangles:</span>
          <span>{stats.triangles.toLocaleString()}</span>
        </div>
        <div className="stat-line">
          <span>Draw Calls:</span>
          <span>{stats.drawCalls}</span>
        </div>
        <div className="stat-line">
          <span>Memory:</span>
          <span>{stats.memory} MB</span>
        </div>
      </div>
    </div>
  );
};
