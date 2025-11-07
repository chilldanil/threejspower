import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';

interface HouseViewerProps {
  modelPath?: string;
  enableShadows?: boolean;
  enableSSAO?: boolean;
  enableBloom?: boolean;
}

export const HouseViewer: React.FC<HouseViewerProps> = ({
  modelPath = '/models/haus.glb',
  enableShadows = true,
  enableSSAO = true,
  enableBloom = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();

    // Professional gradient background
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#87CEEB');    // Sky blue
    gradient.addColorStop(0.7, '#E0F6FF');  // Light blue
    gradient.addColorStop(1, '#FFFFFF');    // White horizon
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 512);

    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;
    scene.fog = new THREE.Fog(0xE0F6FF, 50, 200);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(25, 15, 25);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = enableShadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);

    // Controls - smooth architectural flythrough
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 2.1; // Prevent going below ground
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;
    controls.enablePan = true;
    controls.panSpeed = 0.8;
    controls.screenSpacePanning = false; // Pan horizontally

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    if (enableSSAO) {
      const ssaoPass = new SSAOPass(scene, camera, containerRef.current.clientWidth, containerRef.current.clientHeight);
      ssaoPass.kernelRadius = 16;
      ssaoPass.minDistance = 0.001;
      ssaoPass.maxDistance = 0.1;
      composer.addPass(ssaoPass);
    }

    if (enableBloom) {
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight),
        0.3,
        0.4,
        0.85
      );
      composer.addPass(bloomPass);
    }

    // Architectural lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Sun light (main key light)
    const sunLight = new THREE.DirectionalLight(0xFFF5E6, 2.5);
    sunLight.position.set(30, 50, 20);
    sunLight.castShadow = enableShadows;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    // Fill light (soft blue from sky)
    const skyLight = new THREE.HemisphereLight(0x87CEEB, 0x545454, 0.6);
    scene.add(skyLight);

    // Backlight for depth
    const backLight = new THREE.DirectionalLight(0xB0D4FF, 0.8);
    backLight.position.set(-20, 30, -20);
    scene.add(backLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x8BC34A,
      roughness: 0.8,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = enableShadows;
    scene.add(ground);

    // Grid helper for scale reference
    const gridHelper = new THREE.GridHelper(100, 50, 0x888888, 0xcccccc);
    gridHelper.material.opacity = 0.2;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Axes helper (optional, can be toggled)
    const axesHelper = new THREE.AxesHelper(10);
    axesHelper.visible = false;
    scene.add(axesHelper);

    // Load the house model
    const gltfLoader = new GLTFLoader();

    // Optional: Setup Draco loader for compressed models
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    gltfLoader.setDRACOLoader(dracoLoader);

    let houseModel: THREE.Group;

    gltfLoader.load(
      modelPath,
      (gltf) => {
        houseModel = gltf.scene;

        // Center the model
        const box = new THREE.Box3().setFromObject(houseModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        houseModel.position.x = -center.x;
        houseModel.position.z = -center.z;
        houseModel.position.y = -box.min.y; // Place on ground

        // Enable shadows on all meshes
        houseModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = enableShadows;
            child.receiveShadow = enableShadows;

            // Enhance materials if needed
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    mat.envMapIntensity = 0.5;
                    mat.needsUpdate = true;
                  }
                });
              } else if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMapIntensity = 0.5;
                child.material.needsUpdate = true;
              }
            }
          }
        });

        scene.add(houseModel);

        // Auto-adjust camera to fit the model
        const distance = Math.max(size.x, size.y, size.z) * 2;
        const fov = camera.fov * (Math.PI / 180);
        let cameraDistance = Math.abs(distance / Math.sin(fov / 2));
        cameraDistance *= 1.2; // Add some padding

        camera.position.set(
          cameraDistance * 0.7,
          cameraDistance * 0.5,
          cameraDistance * 0.7
        );
        camera.lookAt(center.x, center.y + size.y / 2, center.z);

        controls.target.set(center.x, center.y + size.y / 2, center.z);
        controls.update();

        setIsLoaded(true);
        console.log('House model loaded successfully!');
        console.log('Model dimensions:', size);
      },
      (progress) => {
        const percentComplete = (progress.loaded / progress.total) * 100;
        setLoadingProgress(percentComplete);
        console.log(`Loading: ${percentComplete.toFixed(2)}%`);
      },
      (error) => {
        console.error('Error loading model:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setError(`Failed to load model: ${errorMessage}`);
      }
    );

    // Animation loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();

      if (enableSSAO || enableBloom) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      composer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Keyboard controls
    const handleKeyPress = (event: KeyboardEvent) => {
      switch(event.key.toLowerCase()) {
        case 'r':
          controls.autoRotate = !controls.autoRotate;
          console.log('Auto-rotate:', controls.autoRotate);
          break;
        case 'g':
          gridHelper.visible = !gridHelper.visible;
          break;
        case 'a':
          axesHelper.visible = !axesHelper.visible;
          break;
        case 'f':
          // Fit camera to model
          if (houseModel) {
            const box = new THREE.Box3().setFromObject(houseModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const distance = Math.max(size.x, size.y, size.z) * 2;
            camera.position.set(distance, distance * 0.7, distance);
            controls.target.copy(center);
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyPress);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      dracoLoader.dispose();
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [modelPath, enableShadows, enableSSAO, enableBloom]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Loading overlay */}
      {!isLoaded && !error && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(10, 10, 15, 0.9)',
          color: '#fff',
          zIndex: 1000
        }}>
          <div style={{ fontSize: '18px', marginBottom: '20px' }}>
            Loading your house model...
          </div>
          <div style={{
            width: '300px',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${loadingProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4a9eff, #7b68ee)',
              transition: 'width 0.3s'
            }} />
          </div>
          <div style={{ marginTop: '10px', fontSize: '14px', opacity: 0.7 }}>
            {loadingProgress.toFixed(0)}%
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(220, 38, 38, 0.95)',
          color: '#fff',
          padding: '20px 30px',
          borderRadius: '8px',
          maxWidth: '80%',
          textAlign: 'center',
          zIndex: 1000
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>⚠️ Error</div>
          <div style={{ fontSize: '14px' }}>{error}</div>
          <div style={{ marginTop: '15px', fontSize: '12px', opacity: 0.8 }}>
            Make sure haus.glb is in the /public/models/ folder
          </div>
        </div>
      )}

      {/* Controls info */}
      {isLoaded && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          background: 'rgba(30, 30, 40, 0.95)',
          color: '#fff',
          padding: '15px 20px',
          borderRadius: '8px',
          fontSize: '13px',
          lineHeight: '1.8',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          maxWidth: '300px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#4a9eff' }}>
            🏠 House Viewer Controls
          </div>
          <div><strong>Left Mouse:</strong> Rotate view</div>
          <div><strong>Right Mouse:</strong> Pan view</div>
          <div><strong>Scroll:</strong> Zoom in/out</div>
          <div><strong>R:</strong> Toggle auto-rotate</div>
          <div><strong>G:</strong> Toggle grid</div>
          <div><strong>F:</strong> Fit to view</div>
        </div>
      )}
    </div>
  );
};
