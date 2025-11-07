import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as SunCalc from 'suncalc';

interface CameraKeyframe {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov?: number;
  label: string;
  description: string;
}

interface WeatherCondition {
  type: 'clear' | 'cloudy' | 'rainy' | 'foggy';
  intensity: number;
}

interface ScrollHouseViewerProps {
  modelPath?: string;
  latitude?: number;
  longitude?: number;
}

export const ScrollHouseViewer: React.FC<ScrollHouseViewerProps> = ({
  modelPath = '/models/haus.glb',
  latitude = 48.1502953252508,
  longitude = 11.567239067279655
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather] = useState<WeatherCondition>({ type: 'clear', intensity: 0.7 });
  const scrollProgressRef = useRef(0);

  // Calculate sun position based on real time and location
  const getSunPosition = (date: Date) => {
    const sunPos = SunCalc.getPosition(date, latitude, longitude);
    const sunDistance = 100;

    return {
      altitude: sunPos.altitude, // angle above horizon
      azimuth: sunPos.azimuth,   // angle from north
      x: sunDistance * Math.cos(sunPos.altitude) * Math.sin(sunPos.azimuth),
      y: sunDistance * Math.sin(sunPos.altitude),
      z: sunDistance * Math.cos(sunPos.altitude) * Math.cos(sunPos.azimuth)
    };
  };

  // Get sky colors based on sun altitude
  const getSkyColors = (altitude: number) => {
    const altitudeDeg = altitude * (180 / Math.PI);

    // Night: altitude < -18°
    // Twilight: -18° < altitude < 0°
    // Day: altitude > 0°

    if (altitudeDeg < -18) {
      // Night
      return {
        top: '#0a0a15',
        middle: '#1a1a2e',
        bottom: '#0f0f1e',
        sunColor: '#ffffff',
        ambientIntensity: 0.15,
        sunIntensity: 0
      };
    } else if (altitudeDeg < -6) {
      // Twilight
      const t = (altitudeDeg + 18) / 12;
      return {
        top: lerpColor('#0a0a15', '#2d3561', t),
        middle: lerpColor('#1a1a2e', '#5a4a7a', t),
        bottom: lerpColor('#0f0f1e', '#ff6b4a', t),
        sunColor: '#ff8855',
        ambientIntensity: 0.2 + t * 0.2,
        sunIntensity: t * 0.5
      };
    } else if (altitudeDeg < 0) {
      // Dawn/Dusk
      const t = (altitudeDeg + 6) / 6;
      return {
        top: lerpColor('#2d3561', '#4a7ba7', t),
        middle: lerpColor('#5a4a7a', '#87CEEB', t),
        bottom: lerpColor('#ff6b4a', '#ffb366', t),
        sunColor: '#ffaa66',
        ambientIntensity: 0.4 + t * 0.2,
        sunIntensity: 0.5 + t * 0.8
      };
    } else if (altitudeDeg < 15) {
      // Early morning/late evening
      const t = altitudeDeg / 15;
      return {
        top: lerpColor('#4a7ba7', '#87CEEB', t),
        middle: lerpColor('#87CEEB', '#B0E0E6', t),
        bottom: lerpColor('#ffb366', '#ffd89b', t),
        sunColor: '#fff5e6',
        ambientIntensity: 0.6 + t * 0.2,
        sunIntensity: 1.3 + t * 0.5
      };
    } else {
      // Full daylight
      const t = Math.min((altitudeDeg - 15) / 45, 1);
      return {
        top: lerpColor('#87CEEB', '#5da9e9', t),
        middle: lerpColor('#B0E0E6', '#87CEEB', t),
        bottom: lerpColor('#ffd89b', '#e3f4ff', t),
        sunColor: '#fff5e6',
        ambientIntensity: 0.8,
        sunIntensity: 1.8 + t * 0.4
      };
    }
  };

  // Helper function to interpolate between colors
  const lerpColor = (color1: string, color2: string, t: number): string => {
    const c1 = parseInt(color1.slice(1), 16);
    const c2 = parseInt(color2.slice(1), 16);

    const r1 = (c1 >> 16) & 255;
    const g1 = (c1 >> 8) & 255;
    const b1 = c1 & 255;

    const r2 = (c2 >> 16) & 255;
    const g2 = (c2 >> 8) & 255;
    const b2 = c2 & 255;

    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);

    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

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

    // Dynamic sky gradient that updates with time
    const updateSkyBackground = (skyColors: ReturnType<typeof getSkyColors>) => {
      const canvasBg = document.createElement('canvas');
      canvasBg.width = 2;
      canvasBg.height = 512;
      const ctx = canvasBg.getContext('2d')!;
      const gradient = ctx.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, skyColors.top);
      gradient.addColorStop(0.5, skyColors.middle);
      gradient.addColorStop(1, skyColors.bottom);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 2, 512);
      scene.background = new THREE.CanvasTexture(canvasBg);

      // Update fog color to match sky
      const fogColor = new THREE.Color(skyColors.middle);
      scene.fog = new THREE.Fog(fogColor.getHex(), 50, 140);
    };

    // Initialize with current time
    const sunPos = getSunPosition(currentTime);
    const skyColors = getSkyColors(sunPos.altitude);
    updateSkyBackground(skyColors);

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

    // Dynamic lighting based on real sun position
    const ambientLight = new THREE.AmbientLight(0xffffff, skyColors.ambientIntensity);
    scene.add(ambientLight);

    // Sun (main directional light) - follows real sun position
    const sunLight = new THREE.DirectionalLight(
      new THREE.Color(skyColors.sunColor),
      skyColors.sunIntensity
    );
    sunLight.position.set(sunPos.x, sunPos.y, sunPos.z);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    // Sky/atmospheric fill light (opposite side of sun for realism)
    const skyLight = new THREE.DirectionalLight(0x87CEEB, 0.3);
    skyLight.position.set(-sunPos.x * 0.3, 20, -sunPos.z * 0.3);
    scene.add(skyLight);

    // Hemisphere light for natural ambiance (sky and ground colors)
    const hemiLight = new THREE.HemisphereLight(
      new THREE.Color(skyColors.middle),
      new THREE.Color(skyColors.bottom),
      0.4
    );
    scene.add(hemiLight);

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

    // Create procedural clouds
    const clouds: THREE.Mesh[] = [];
    const createClouds = () => {
      const cloudCount = 15;
      for (let i = 0; i < cloudCount; i++) {
        const cloudGeometry = new THREE.SphereGeometry(8 + Math.random() * 12, 8, 8);
        const cloudMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.15 + Math.random() * 0.15,
          fog: false
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);

        // Position clouds in a ring around the scene
        const angle = (i / cloudCount) * Math.PI * 2;
        const distance = 60 + Math.random() * 40;
        cloud.position.set(
          Math.cos(angle) * distance,
          30 + Math.random() * 20,
          Math.sin(angle) * distance
        );

        cloud.scale.set(
          1 + Math.random() * 0.5,
          0.6 + Math.random() * 0.3,
          1 + Math.random() * 0.5
        );

        scene.add(cloud);
        clouds.push(cloud);
      }
    };
    createClouds();

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

      // Subtle model rotation
      if (houseModel) {
        houseModel.rotation.y = progress * Math.PI * 0.2;
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    // Real-time update interval (update sun position every minute)
    let lastTimeUpdate = Date.now();
    const timeUpdateInterval = 60000; // 1 minute

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const now = Date.now();
      const time = now * 0.0003;

      // Update time and sun position periodically
      if (now - lastTimeUpdate > timeUpdateInterval) {
        lastTimeUpdate = now;
        const newTime = new Date();
        setCurrentTime(newTime);

        const newSunPos = getSunPosition(newTime);
        const newSkyColors = getSkyColors(newSunPos.altitude);

        // Update sun light position
        sunLight.position.set(newSunPos.x, newSunPos.y, newSunPos.z);
        sunLight.color = new THREE.Color(newSkyColors.sunColor);
        sunLight.intensity = newSkyColors.sunIntensity;

        // Update ambient light
        ambientLight.intensity = newSkyColors.ambientIntensity;

        // Update hemisphere light colors
        hemiLight.color = new THREE.Color(newSkyColors.middle);
        hemiLight.groundColor = new THREE.Color(newSkyColors.bottom);

        // Update sky background
        updateSkyBackground(newSkyColors);

        // Update sky light position (opposite of sun)
        skyLight.position.set(-newSunPos.x * 0.3, 20, -newSunPos.z * 0.3);
      }

      // Very subtle breathing animation on house
      if (houseModel) {
        houseModel.position.y = Math.sin(time) * 0.05;
      }

      // Animate clouds - slow drift
      clouds.forEach((cloud, i) => {
        cloud.position.x += Math.sin(time * 0.1 + i) * 0.01;
        cloud.position.z += Math.cos(time * 0.1 + i) * 0.01;
        cloud.rotation.z += 0.0001;

        // Keep clouds in visible range
        const distance = Math.sqrt(cloud.position.x ** 2 + cloud.position.z ** 2);
        if (distance > 120) {
          const angle = Math.atan2(cloud.position.z, cloud.position.x) + Math.PI;
          cloud.position.x = Math.cos(angle) * 70;
          cloud.position.z = Math.sin(angle) * 70;
        }
      });

      // Subtle camera shake for cinematic feel
      if (camera) {
        camera.position.x += Math.sin(time * 2) * 0.005;
        camera.position.y += Math.cos(time * 3) * 0.004;
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

          {/* Real-time info display */}
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            zIndex: 1000,
            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.9) 0%, rgba(45, 53, 97, 0.85) 100%)',
            backdropFilter: 'blur(20px)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(74, 158, 255, 0.3)',
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: '13px',
            lineHeight: '1.8',
            minWidth: '220px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#4a9eff',
              marginBottom: '12px',
              fontWeight: 700
            }}>
              Live Environment
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ opacity: 0.6 }}>Time:</span>{' '}
              <span style={{ fontWeight: 600 }}>
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ opacity: 0.6 }}>Location:</span>{' '}
              <span style={{ fontWeight: 600 }}>Munich, DE</span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ opacity: 0.6 }}>Weather:</span>{' '}
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                {weather.type} {getSunPosition(currentTime).altitude > 0 ? '☀️' : '🌙'}
              </span>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ opacity: 0.6 }}>Sun Alt:</span>{' '}
              <span style={{ fontWeight: 600 }}>
                {(getSunPosition(currentTime).altitude * (180 / Math.PI)).toFixed(1)}°
              </span>
            </div>
            <div style={{
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(74, 158, 255, 0.2)',
              fontSize: '10px',
              opacity: 0.7
            }}>
              Physically accurate sun position & shadows
            </div>
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
