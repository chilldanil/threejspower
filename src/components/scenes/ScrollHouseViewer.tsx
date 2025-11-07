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

  // Define cinematic camera paths with more dynamic movements
  const cameraKeyframes: CameraKeyframe[] = [
    {
      position: [40, 25, 40],
      lookAt: [0, 8, 0],
      fov: 55,
      label: 'First Impressions',
      description: 'Where architecture meets imagination. Every great journey begins with a single view.'
    },
    {
      position: [30, 12, 15],
      lookAt: [0, 6, 0],
      fov: 48,
      label: 'Approaching',
      description: 'Drawing closer, the details begin to reveal themselves. Form and function in perfect harmony.'
    },
    {
      position: [20, 8, -5],
      lookAt: [0, 7, 0],
      fov: 42,
      label: 'Main Entrance',
      description: 'The threshold of possibility. Modern lines frame the entrance, inviting you to explore.'
    },
    {
      position: [-15, 10, 15],
      lookAt: [0, 8, 0],
      fov: 50,
      label: 'Left Profile',
      description: 'Sculptural elements catch the light. Each angle reveals new dimensions of design.'
    },
    {
      position: [0, 18, 30],
      lookAt: [0, 6, 0],
      fov: 52,
      label: 'Rear Perspective',
      description: 'Seamless integration with the environment. Architecture that breathes with its surroundings.'
    },
    {
      position: [25, 6, 0],
      lookAt: [-5, 8, 0],
      fov: 38,
      label: 'Close Detail',
      description: 'Precision in every edge. Material choices that speak to quality and craftsmanship.'
    },
    {
      position: [15, 14, -25],
      lookAt: [0, 7, 0],
      fov: 46,
      label: 'Right Elevation',
      description: 'Symmetry balanced with surprise. Windows frame views and bring the outside in.'
    },
    {
      position: [-25, 16, -20],
      lookAt: [0, 5, 0],
      fov: 50,
      label: 'Corner Composition',
      description: 'Where two facades meet, creating dynamic interplay of light and shadow.'
    },
    {
      position: [0, 35, 20],
      lookAt: [0, 0, 0],
      fov: 60,
      label: 'From Above',
      description: 'The complete vision revealed. Roof design and spatial relationships in context.'
    },
    {
      position: [8, 4, 18],
      lookAt: [0, 6, 0],
      fov: 35,
      label: 'Human Scale',
      description: 'At eye level, feeling the proportions. This is where architecture becomes experience.'
    },
    {
      position: [-30, 20, 25],
      lookAt: [0, 8, 0],
      fov: 48,
      label: 'Golden Hour',
      description: 'As light shifts, surfaces transform. Architecture designed for every moment of the day.'
    },
    {
      position: [35, 28, 0],
      lookAt: [0, 5, 0],
      fov: 58,
      label: 'Final Farewell',
      description: 'A lasting impression. This is more than a house—it\'s a vision realized.'
    }
  ];

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();

    // Cinematic gradient background - deeper, richer tones
    const canvasBg = document.createElement('canvas');
    canvasBg.width = 2;
    canvasBg.height = 512;
    const ctx = canvasBg.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#0a0a15');
    gradient.addColorStop(0.3, '#1a1a2e');
    gradient.addColorStop(0.6, '#2d3561');
    gradient.addColorStop(1, '#3d4a7a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 512);
    scene.background = new THREE.CanvasTexture(canvasBg);
    scene.fog = new THREE.Fog(0x1a1a2e, 50, 140);

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

    // Enhanced cinematic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main key light with enhanced shadow quality
    const mainLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    mainLight.position.set(30, 50, 20);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.camera.left = -50;
    mainLight.shadow.camera.right = 50;
    mainLight.shadow.camera.top = 50;
    mainLight.shadow.camera.bottom = -50;
    mainLight.shadow.bias = -0.0001;
    mainLight.shadow.normalBias = 0.02;
    scene.add(mainLight);

    // Cool fill light
    const fillLight = new THREE.DirectionalLight(0x8fb4ff, 0.8);
    fillLight.position.set(-20, 30, -20);
    scene.add(fillLight);

    // Rim light for edge definition
    const rimLight = new THREE.DirectionalLight(0xadd8e6, 1.0);
    rimLight.position.set(-30, 10, 30);
    scene.add(rimLight);

    // Hemisphere light for natural ambiance
    const hemiLight = new THREE.HemisphereLight(0x8fb4ff, 0x2a2a3e, 0.6);
    scene.add(hemiLight);

    // Add subtle accent lights
    const accentLight1 = new THREE.PointLight(0x4a9eff, 0.8, 50);
    accentLight1.position.set(15, 10, 15);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0xff6b9d, 0.6, 40);
    accentLight2.position.set(-15, 8, -15);
    scene.add(accentLight2);

    // Enhanced ground with gradient material
    const groundGeometry = new THREE.CircleGeometry(100, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.9,
      metalness: 0.1,
      emissive: 0x0a0a15,
      emissiveIntensity: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Refined grid with subtle glow
    const gridHelper = new THREE.GridHelper(100, 50, 0x4a9eff, 0x2a2a3e);
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Load house model
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    gltfLoader.setDRACOLoader(dracoLoader);

    let houseModel: THREE.Group;
    let modelCenter = new THREE.Vector3();

    gltfLoader.load(
      modelPath,
      (gltf) => {
        houseModel = gltf.scene;

        const box = new THREE.Box3().setFromObject(houseModel);
        modelCenter = box.getCenter(new THREE.Vector3());

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

      // Dynamic model rotation based on scroll
      if (houseModel) {
        // Smoother rotation with acceleration/deceleration
        houseModel.rotation.y = progress * Math.PI * 0.5 + Math.sin(progress * Math.PI) * 0.1;
      }

      // Dynamic lighting adjustment based on scroll position
      if (mainLight) {
        const lightAngle = progress * Math.PI * 2;
        mainLight.position.x = Math.cos(lightAngle) * 40;
        mainLight.position.z = Math.sin(lightAngle) * 40;
        mainLight.position.y = 50 + Math.sin(progress * Math.PI) * 10;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Very subtle breathing animation
      if (houseModel) {
        const time = Date.now() * 0.0003;
        houseModel.position.y = Math.sin(time) * 0.05;
      }

      // Subtle camera shake for cinematic feel
      if (camera) {
        const time = Date.now() * 0.0001;
        camera.position.x += Math.sin(time * 2) * 0.01;
        camera.position.y += Math.cos(time * 3) * 0.008;
      }

      // Animate accent lights
      if (accentLight1) {
        const time = Date.now() * 0.0005;
        accentLight1.intensity = 0.8 + Math.sin(time) * 0.2;
      }
      if (accentLight2) {
        const time = Date.now() * 0.0004;
        accentLight2.intensity = 0.6 + Math.cos(time) * 0.15;
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

      {/* Scrollable content sections with parallax */}
      {isLoaded && (
        <>
          {cameraKeyframes.map((keyframe, index) => {
            const parallaxOffset = (scrollProgressRef.current - index / cameraKeyframes.length) * 50;
            const isActive = currentSection === index;

            return (
              <section
                key={index}
                style={{
                  position: 'relative',
                  height: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: index % 2 === 0 ? 'flex-start' : 'flex-end',
                  padding: '0 8%',
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
              >
                <div style={{
                  maxWidth: '600px',
                  color: '#fff',
                  opacity: isActive ? 1 : 0.2,
                  transform: `translateY(${isActive ? 0 : 30}px) translateX(${parallaxOffset}px) scale(${isActive ? 1 : 0.95})`,
                  transition: 'all 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)',
                  pointerEvents: 'auto',
                  background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.85) 0%, rgba(45, 53, 97, 0.75) 100%)',
                  backdropFilter: 'blur(20px)',
                  padding: '40px',
                  borderRadius: '16px',
                  border: '1px solid rgba(74, 158, 255, 0.2)',
                  boxShadow: isActive ? '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(74, 158, 255, 0.1)' : '0 10px 30px rgba(0, 0, 0, 0.3)'
                }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '4px',
                    color: '#4a9eff',
                    marginBottom: '16px',
                    opacity: isActive ? 1 : 0.5,
                    transition: 'opacity 0.6s ease'
                  }}>
                    Chapter {String(index + 1).padStart(2, '0')}
                    <span style={{
                      margin: '0 12px',
                      opacity: 0.3
                    }}>•</span>
                    {String(cameraKeyframes.length).padStart(2, '0')} Views
                  </div>
                  <h2 style={{
                    fontSize: '56px',
                    fontWeight: 800,
                    marginBottom: '20px',
                    lineHeight: 1.1,
                    textShadow: '0 4px 30px rgba(0,0,0,0.7)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #4a9eff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {keyframe.label}
                  </h2>
                  <p style={{
                    fontSize: '18px',
                    lineHeight: 1.8,
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 300,
                    marginBottom: '24px'
                  }}>
                    {keyframe.description}
                  </p>
                  <div style={{
                    height: '3px',
                    width: isActive ? '100%' : '0%',
                    background: 'linear-gradient(90deg, #4a9eff, #7b68ee)',
                    transition: 'width 0.8s ease',
                    borderRadius: '2px',
                    opacity: isActive ? 1 : 0
                  }} />
                </div>
              </section>
            );
          })}

          {/* Scroll indicator */}
          <div style={{
            position: 'fixed',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            color: '#fff',
            fontSize: '13px',
            textAlign: 'center',
            opacity: scrollProgressRef.current < 0.08 ? 1 : 0,
            transition: 'opacity 0.5s',
            pointerEvents: 'none'
          }}>
            <div style={{
              marginBottom: '12px',
              fontWeight: 400,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              Begin Your Journey
            </div>
            <div style={{
              width: '2px',
              height: '50px',
              background: 'linear-gradient(180deg, transparent, #4a9eff, transparent)',
              margin: '0 auto',
              animation: 'scroll-bounce 2.5s ease-in-out infinite',
              boxShadow: '0 0 20px rgba(74, 158, 255, 0.5)'
            }} />
          </div>

          {/* Progress bar */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'rgba(0, 0, 0, 0.3)',
            zIndex: 1000,
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #4a9eff 0%, #7b68ee 50%, #ff6b9d 100%)',
              width: `${scrollProgressRef.current * 100}%`,
              transition: 'width 0.1s ease-out',
              boxShadow: '0 0 20px rgba(74, 158, 255, 0.6)'
            }} />
          </div>

          {/* Section indicators */}
          <div style={{
            position: 'fixed',
            right: '30px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {cameraKeyframes.map((_, index) => (
              <div
                key={index}
                style={{
                  width: currentSection === index ? '40px' : '8px',
                  height: '3px',
                  background: currentSection === index
                    ? 'linear-gradient(90deg, #4a9eff, #7b68ee)'
                    : 'rgba(255, 255, 255, 0.3)',
                  borderRadius: '2px',
                  transition: 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)',
                  boxShadow: currentSection === index ? '0 0 10px rgba(74, 158, 255, 0.5)' : 'none'
                }}
              />
            ))}
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
