import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

interface CameraKeyframe {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov?: number;
  label: string;
  description: string;
}

interface ScrollHouseViewerProps {
  modelPath?: string;
}

export const ScrollHouseViewer: React.FC<ScrollHouseViewerProps> = ({
  modelPath = '/models/haus.glb'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const scrollProgressRef = useRef(0);

  // Define cinematic camera paths
  const cameraKeyframes: CameraKeyframe[] = [
    {
      position: [30, 20, 30],
      lookAt: [0, 5, 0],
      fov: 50,
      label: 'Welcome',
      description: 'Discover your dream home'
    },
    {
      position: [25, 8, 0],
      lookAt: [0, 8, 0],
      fov: 45,
      label: 'Front View',
      description: 'Modern architectural design'
    },
    {
      position: [0, 15, 25],
      lookAt: [0, 8, 0],
      fov: 50,
      label: 'Side Perspective',
      description: 'Elegant lines and structure'
    },
    {
      position: [-20, 12, 20],
      lookAt: [0, 6, 0],
      fov: 48,
      label: 'Corner View',
      description: 'Every angle tells a story'
    },
    {
      position: [0, 25, 15],
      lookAt: [0, 0, 0],
      fov: 55,
      label: 'Aerial View',
      description: 'See the complete picture'
    },
    {
      position: [15, 5, -20],
      lookAt: [0, 5, 0],
      fov: 42,
      label: 'Detail Shot',
      description: 'Crafted with precision'
    },
    {
      position: [35, 18, 25],
      lookAt: [0, 8, 0],
      fov: 50,
      label: 'Final Look',
      description: 'Your journey begins here'
    }
  ];

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();

    // Cinematic gradient background
    const canvasBg = document.createElement('canvas');
    canvasBg.width = 2;
    canvasBg.height = 512;
    const ctx = canvasBg.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#2d3561');
    gradient.addColorStop(1, '#4a5899');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 512);
    scene.background = new THREE.CanvasTexture(canvasBg);
    scene.fog = new THREE.Fog(0x2d3561, 40, 120);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(...cameraKeyframes[0].position);
    camera.lookAt(...cameraKeyframes[0].lookAt);

    // Renderer
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
    renderer.toneMappingExposure = 1.3;

    // Cinematic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    mainLight.position.set(30, 50, 20);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.camera.left = -40;
    mainLight.shadow.camera.right = 40;
    mainLight.shadow.camera.top = 40;
    mainLight.shadow.camera.bottom = -40;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x8fb4ff, 0.6);
    fillLight.position.set(-20, 30, -20);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(-30, 10, 30);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0x8fb4ff, 0x444444, 0.5);
    scene.add(hemiLight);

    // Ground
    const groundGeometry = new THREE.CircleGeometry(80, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a3e,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle grid
    const gridHelper = new THREE.GridHelper(80, 40, 0x444466, 0x2a2a3e);
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Load house model
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    gltfLoader.setDRACOLoader(dracoLoader);

    let houseModel: THREE.Group;
    let modelCenter = new THREE.Vector3();
    let modelSize = new THREE.Vector3();

    gltfLoader.load(
      modelPath,
      (gltf) => {
        houseModel = gltf.scene;

        const box = new THREE.Box3().setFromObject(houseModel);
        modelCenter = box.getCenter(new THREE.Vector3());
        modelSize = box.getSize(new THREE.Vector3());

        houseModel.position.x = -modelCenter.x;
        houseModel.position.z = -modelCenter.z;
        houseModel.position.y = -box.min.y;

        houseModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(houseModel);
        setIsLoaded(true);
      },
      (progress) => {
        setLoadingProgress((progress.loaded / progress.total) * 100);
      },
      (error) => {
        console.error('Error loading model:', error);
      }
    );

    // Scroll animation
    const handleScroll = () => {
      if (!isLoaded || !containerRef.current) return;

      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = Math.min(scrolled / scrollHeight, 1);
      scrollProgressRef.current = progress;

      // Calculate which keyframe section we're in
      const totalKeyframes = cameraKeyframes.length - 1;
      const exactPosition = progress * totalKeyframes;
      const currentKeyframe = Math.floor(exactPosition);
      const nextKeyframe = Math.min(currentKeyframe + 1, totalKeyframes);
      const localProgress = exactPosition - currentKeyframe;

      setCurrentSection(currentKeyframe);

      // Smooth interpolation between keyframes
      const current = cameraKeyframes[currentKeyframe];
      const next = cameraKeyframes[nextKeyframe];

      // Easing function for smooth motion
      const easeInOutCubic = (t: number) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };
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

      // Subtle model rotation for dynamism
      if (houseModel) {
        houseModel.rotation.y = progress * Math.PI * 0.3;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Subtle breathing animation
      if (houseModel) {
        const time = Date.now() * 0.0005;
        houseModel.position.y = -modelSize.y * 0.5 + Math.sin(time) * 0.1;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [isLoaded, modelPath]);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Fixed canvas */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0
      }}>
        <canvas ref={canvasRef} />
      </div>

      {/* Loading overlay */}
      {!isLoaded && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #2d3561 100%)',
          color: '#fff',
          zIndex: 1000
        }}>
          <div style={{ fontSize: '28px', marginBottom: '20px', fontWeight: 300 }}>
            Loading your experience...
          </div>
          <div style={{
            width: '400px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${loadingProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4a9eff, #7b68ee)',
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      )}

      {/* Scrollable content sections */}
      {isLoaded && (
        <>
          {cameraKeyframes.map((keyframe, index) => (
            <section
              key={index}
              style={{
                position: 'relative',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
                padding: '0 10%',
                zIndex: 10,
                pointerEvents: 'none'
              }}
            >
              <div style={{
                maxWidth: '500px',
                color: '#fff',
                opacity: currentSection === index ? 1 : 0.3,
                transform: currentSection === index ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.6s ease',
                pointerEvents: 'auto'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '3px',
                  color: '#4a9eff',
                  marginBottom: '12px'
                }}>
                  {String(index + 1).padStart(2, '0')} / {String(cameraKeyframes.length).padStart(2, '0')}
                </div>
                <h2 style={{
                  fontSize: '48px',
                  fontWeight: 700,
                  marginBottom: '16px',
                  lineHeight: 1.2,
                  textShadow: '0 2px 20px rgba(0,0,0,0.5)'
                }}>
                  {keyframe.label}
                </h2>
                <p style={{
                  fontSize: '20px',
                  lineHeight: 1.6,
                  color: '#ccc',
                  fontWeight: 300
                }}>
                  {keyframe.description}
                </p>
              </div>
            </section>
          ))}

          {/* Scroll indicator */}
          <div style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            color: '#fff',
            fontSize: '14px',
            textAlign: 'center',
            opacity: scrollProgressRef.current < 0.1 ? 1 : 0,
            transition: 'opacity 0.5s'
          }}>
            <div style={{ marginBottom: '10px', fontWeight: 300 }}>Scroll to explore</div>
            <div style={{
              width: '2px',
              height: '40px',
              background: 'linear-gradient(180deg, transparent, #4a9eff)',
              margin: '0 auto',
              animation: 'scroll-bounce 2s infinite'
            }} />
          </div>

          {/* Progress bar */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '3px',
            background: 'rgba(255,255,255,0.1)',
            zIndex: 1000
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #4a9eff, #7b68ee)',
              width: `${scrollProgressRef.current * 100}%`,
              transition: 'width 0.1s'
            }} />
          </div>
        </>
      )}

      <style>{`
        @keyframes scroll-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
      `}</style>
    </div>
  );
};
