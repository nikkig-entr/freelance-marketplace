'use client';

import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface Hero3DMonolithProps {
  /** Container width */
  width?: number;
  /** Container height */
  height?: number;
  /** Reduced motion preference */
  reduceMotion?: boolean;
}

interface BlockData {
  baseX: number;
  baseY: number;
  baseZ: number;
  baseScale: number;
  velocity: THREE.Vector3;
  seed: number;
  wireframe: THREE.LineSegments;
  wireframeMat: THREE.LineBasicMaterial;
  explosionVector: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
}

export function Hero3DMonolith({
  width = 1920,
  height = 1080,
  reduceMotion = false,
}: Hero3DMonolithProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const monolithRef = useRef<THREE.Group | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);
  const blocksRef = useRef<THREE.Mesh[]>([]);
  const blockDataRef = useRef<BlockData[]>([]);
  const ringsRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);
  const isPausedRef = useRef(false);
  const scrollYRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const isInitializedRef = useRef(false);

  // Configuration
  const config = useMemo(() => ({
    blockCount: 36,
    layers: 6,
    blocksPerLayer: 6,
    baseBlockSize: Math.min(width, height) * 0.028,
    layerHeight: 1.35,
    radius: 1.8,
    coreRadius: 0.65,
    maxExplosionDistance: 8.5,
    maxScrollProgress: window.innerHeight,
    pointerInfluence: Math.max(width, height) * 0.35,
    pointerForce: Math.max(width, height) * 0.22,
    tiltMax: THREE.MathUtils.degToRad(18),
    cameraStartZ: 7.4,
    cameraEndZ: 14.5,
  }), [width, height]);

  // Initialize Three.js scene
  const initializeScene = () => {
    const container = containerRef.current;
    if (!container || !canvasRef.current) return;

    const rect = container.getBoundingClientRect();
    const w = rect.width || width;
    const h = rect.height || height;

    // Renderer - studio quality
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Studio environment reflection (PMREMGenerator + RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    const envMap = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    scene.environment = envMap;
    scene.background = null; // Transparent for #050505 page background
    roomEnv.dispose();

    // Camera - PerspectiveCamera(36, width/height, 0.1, 100)
    const camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
    camera.position.set(0, 0.1, config.cameraStartZ);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Monolith group - centered at origin
    const monolith = new THREE.Group();
    monolith.position.set(0, 0, 0);
    scene.add(monolith);
    monolithRef.current = monolith;

    // Materials
    const blockMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x222222,
      metalness: 0.88,
      roughness: 0.18,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
    });

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });

    // Core - OctahedronGeometry
    const coreGeometry = new THREE.OctahedronGeometry(config.coreRadius, 0);
    const coreMesh = new THREE.Mesh(coreGeometry, blockMaterial.clone());
    coreMesh.position.set(0, 0, 0);
    monolith.add(coreMesh);
    coreRef.current = coreMesh;

    // Core wireframe
    const coreEdges = new THREE.EdgesGeometry(coreGeometry);
    const coreWireframe = new THREE.LineSegments(coreEdges, edgeMaterial.clone());
    coreWireframe.scale.copy(coreMesh.scale);
    coreMesh.add(coreWireframe);

    // Block geometry
    const blockGeometry = new THREE.BoxGeometry(1, 1, 1);

    // Generate 36 blocks around the core (6 layers × 6 blocks)
    const blocks: THREE.Mesh[] = [];
    const blockData: BlockData[] = [];

    for (let layer = 0; layer < config.layers; layer++) {
      for (let i = 0; i < config.blocksPerLayer; i++) {
        const angle = (i / config.blocksPerLayer) * Math.PI * 2;
        const layerOffset = (layer % 2) * (Math.PI / config.blocksPerLayer); // Stagger layers
        const finalAngle = angle + layerOffset;

        // Vary block proportions architecturally
        const heightVariation = 0.7 + (layer / config.layers) * 1.8 + Math.random() * 0.3;
        const widthVariation = 0.5 + Math.random() * 0.4;
        const depthVariation = 0.5 + Math.random() * 0.4;

        const x = Math.cos(finalAngle) * config.radius;
        const y = Math.sin(finalAngle) * config.radius;
        const z = (layer - (config.layers - 1) / 2) * config.layerHeight * config.baseBlockSize;

        const mesh = new THREE.Mesh(blockGeometry, blockMaterial.clone());
        mesh.scale.set(
          config.baseBlockSize * widthVariation,
          config.baseBlockSize * heightVariation,
          config.baseBlockSize * depthVariation
        );
        mesh.position.set(x, y, z);

        // Wireframe edges
        const edges = new THREE.EdgesGeometry(blockGeometry);
        const wireframe = new THREE.LineSegments(edges, edgeMaterial.clone());
        wireframe.scale.copy(mesh.scale);
        wireframe.position.copy(mesh.position);
        mesh.add(wireframe);

        // Explosion vector (radial + vertical)
        const radialDist = Math.sqrt(x * x + y * y);
        const radialAngle = Math.atan2(y, x);
        const explosionVector = new THREE.Vector3(
          Math.cos(radialAngle) * radialDist * 1.5,
          Math.sin(radialAngle) * radialDist * 1.5,
          z * 0.8 + (heightVariation * config.baseBlockSize) * 2
        );

        // Random rotation speeds for fragmentation
        const rotationSpeed = new THREE.Vector3(
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.8,
          (Math.random() - 0.5) * 0.8
        );

        const data: BlockData = {
          baseX: x,
          baseY: y,
          baseZ: z,
          baseScale: config.baseBlockSize * heightVariation,
          velocity: new THREE.Vector3(),
          seed: Math.random() * 1000,
          wireframe,
          wireframeMat: edgeMaterial.clone(),
          explosionVector,
          rotationSpeed,
        };

        monolith.add(mesh);
        blocks.push(mesh);
        blockData.push(data);
      }
    }

    // Two thin tilted orbital gyroscope rings
    const ringGeometry1 = new THREE.TorusGeometry(2.15, 0.008, 16, 128);
    const ringGeometry2 = new THREE.TorusGeometry(2.45, 0.006, 16, 128);

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });

    const ring1 = new THREE.Mesh(ringGeometry1, ringMaterial.clone());
    ring1.rotation.x = Math.PI / 2; // Horizontal
    monolith.add(ring1);

    const ring2 = new THREE.Mesh(ringGeometry2, ringMaterial.clone());
    ring2.rotation.x = Math.PI / 2;
    ring2.rotation.z = Math.PI / 4; // Tilted 45°
    monolith.add(ring2);

    ringsRef.current = [ring1, ring2];
    blocksRef.current = blocks;
    blockDataRef.current = blockData;
    isInitializedRef.current = true;
  };

  // Handle resize
  const handleResize = () => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    if (!container || !canvas || !renderer || !camera) return;

    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  };

  // Pointer handlers
  const handlePointerMove = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    pointerRef.current.x = clientX - rect.left - rect.width * 0.5;
    pointerRef.current.y = clientY - rect.top - rect.height * 0.5;
  };

  const handlePointerLeave = () => {
    pointerRef.current.x = 0;
    pointerRef.current.y = 0;
  };

  // Animation loop
  const animate = () => {
    if (isPausedRef.current) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }

    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const monolith = monolithRef.current;
    const core = coreRef.current;
    const blocks = blocksRef.current;
    const blockData = blockDataRef.current;
    const rings = ringsRef.current;

    if (!renderer || !scene || !camera || !monolith || !blocks.length) return;

    timeRef.current += 1 / 60;

    // Scroll progress from window.scrollY (passive read, zero React state)
    const scrollY = window.scrollY;
    scrollYRef.current = scrollY;
    const scrollProgress = Math.min(1, scrollY / config.maxScrollProgress);
    const easedProgress = 1 - Math.pow(1 - scrollProgress, 3); // Cubic ease-out

    // Camera pull back
    const targetCameraZ = THREE.MathUtils.lerp(config.cameraStartZ, config.cameraEndZ, easedProgress);
    camera.position.z += (targetCameraZ - camera.position.z) * 0.08;

    // Pointer interaction - tilt & magnetic dispersion
    const pointer = pointerRef.current;
    let targetTiltX = 0;
    let targetTiltY = 0;

    if (pointer && !reduceMotion) {
      targetTiltX = THREE.MathUtils.clamp(
        (pointer.y / (config.maxScrollProgress * 0.5)) * config.tiltMax,
        -config.tiltMax,
        config.tiltMax
      );
      targetTiltY = THREE.MathUtils.clamp(
        (pointer.x / (config.maxScrollProgress * 0.5)) * -config.tiltMax,
        -config.tiltMax,
        config.tiltMax
      );
    }

    // Smooth monolith tilt
    monolith.rotation.x += (targetTiltX - monolith.rotation.x) * 0.05;
    monolith.rotation.y += (targetTiltY - monolith.rotation.y) * 0.05;

    // Subtle idle rotation
    if (Math.abs(pointer.x) < 1 && Math.abs(pointer.y) < 1 && !reduceMotion) {
      monolith.rotation.y += 0.00015;
      monolith.rotation.x += 0.00008;
    }

    // Core rotation
    if (core && !reduceMotion) {
      core.rotation.x += 0.0008;
      core.rotation.y += 0.0012;
    }

    // Animate orbital rings on opposing axes
    if (!reduceMotion) {
      rings.forEach((ring, i) => {
        const speed = 0.0003 * (i === 0 ? 1 : -1.3);
        ring.rotation.x += speed * 0.5;
        ring.rotation.y += speed * 0.3;
        ring.rotation.z += speed;
      });
    }

    // Update each block with scroll-driven explosion
    blocks.forEach((mesh, index) => {
      const data = blockData[index];

      // Explosion offset
      const explodeX = data.explosionVector.x * easedProgress;
      const explodeY = data.explosionVector.y * easedProgress;
      const explodeZ = data.explosionVector.z * easedProgress;

      // Pointer magnetic repulsion
      let repulseX = 0;
      let repulseY = 0;
      let repulseZ = 0;

      if (pointer && !reduceMotion) {
        const dx = mesh.position.x - pointer.x * 0.003;
        const dy = mesh.position.y - pointer.y * 0.003;
        const dist2D = Math.sqrt(dx * dx + dy * dy);
        const influenceRadius = config.pointerInfluence * 0.002;

        if (dist2D < influenceRadius) {
          const force = (1 - dist2D / influenceRadius) * config.pointerForce * 0.0015;
          const angle = Math.atan2(dy, dx);
          repulseX = Math.cos(angle) * force;
          repulseY = Math.sin(angle) * force;
          repulseZ = force * 0.5;
        }
      }

      // Spring physics
      const springK = 0.08;
      const damping = 0.82;

      const targetX = data.baseX + explodeX + repulseX;
      const targetY = data.baseY + explodeY + repulseY;
      const targetZ = data.baseZ + explodeZ + repulseZ;

      data.velocity.x += (targetX - mesh.position.x) * springK;
      data.velocity.y += (targetY - mesh.position.y) * springK;
      data.velocity.z += (targetZ - mesh.position.z) * springK;

      data.velocity.x *= damping;
      data.velocity.y *= damping;
      data.velocity.z *= damping;

      mesh.position.x += data.velocity.x;
      mesh.position.y += data.velocity.y;
      mesh.position.z += data.velocity.z;

      // Block rotation during fragmentation
      if (easedProgress > 0.1) {
        const rotFactor = easedProgress * 0.5;
        mesh.rotation.x += data.rotationSpeed.x * rotFactor;
        mesh.rotation.y += data.rotationSpeed.y * rotFactor;
        mesh.rotation.z += data.rotationSpeed.z * rotFactor;
      }

      // Wireframe follows mesh
      data.wireframe.position.copy(mesh.position);
      data.wireframe.rotation.copy(mesh.rotation);

      // Wireframe opacity based on distance from camera
      const distFromCamera = camera.position.z - mesh.position.z;
      data.wireframeMat.opacity = THREE.MathUtils.clamp(0.6 + 0.4 * (1 - distFromCamera / 20), 0.4, 0.95);
    });

    // Sort blocks by depth for transparency
    blocks.sort((a, b) => b.position.z - a.position.z);

    renderer.render(scene, camera);
    animationRef.current = requestAnimationFrame(animate);
  };

  // Initialize on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    initializeScene();

    // ResizeObserver
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', handleResize);

    // Pointer event handlers
    const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    // Pointer events
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', onMouseMove, { passive: true });
      container.addEventListener('mouseleave', handlePointerLeave);
      container.addEventListener('touchmove', onTouchMove, { passive: true });
      container.addEventListener('touchstart', onTouchStart, { passive: true });
      container.addEventListener('touchend', handlePointerLeave);
    }

    // IntersectionObserver to pause RAF when Hero is out of view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isPausedRef.current = !entry.isIntersecting;
        });
      },
      { root: null, rootMargin: '0px', threshold: 0 }
    );
    if (container) {
      observer.observe(container);
    }

    // Start animation loop
    animate();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      if (container) {
        container.removeEventListener('mousemove', onMouseMove);
        container.removeEventListener('mouseleave', handlePointerLeave);
        container.removeEventListener('touchmove', onTouchMove);
        container.removeEventListener('touchstart', onTouchStart);
        container.removeEventListener('touchend', handlePointerLeave);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      // Cleanup Three.js resources
      rendererRef.current?.dispose();
      sceneRef.current?.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) {
            obj.material.dispose();
          } else if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          }
        }
        if (obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) {
            obj.material.dispose();
          }
        }
      });
      // Dispose PMREM generator
      // Note: PMREMGenerator is local to initializeScene, renderer.dispose() handles it
    };
  }, [width, height, reduceMotion]);

  // Re-initialize on significant size change
  useEffect(() => {
    if (isInitializedRef.current) {
      handleResize();
    }
  }, [width, height]);

  // Server-side rendering fallback
  if (typeof window === 'undefined') {
    return (
      <div
        ref={containerRef}
        className="relative w-full h-full"
        style={{ width: '100%', height: '100%' }}
        aria-hidden="true"
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
          style={{ touchAction: 'auto', display: 'block' }}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
      role="img"
      aria-label="Architectural monolith sculpture - interactive 3D WebGL"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ touchAction: 'auto', display: 'block' }}
      />
      <noscript>
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
          <div className="text-center p-8">
            <svg width="64" height="64" viewBox="0 0 48 48" fill="none" className="mx-auto mb-6 opacity-50" stroke="currentColor" strokeWidth="1.5">
              <circle cx="24" cy="24" r="20" />
              <line x1="24" y1="8" x2="24" y2="40" />
              <line x1="8" y1="24" x2="40" y2="24" />
              <line x1="13" y1="13" x2="35" y2="35" />
              <line x1="35" y1="13" x2="13" y2="35" />
              <rect x="21" y="21" width="6" height="6" rx="1" />
            </svg>
            <p className="font-mono text-xs text-neutral-500 tracking-wider uppercase">
              WebGL required for 3D monolith
            </p>
          </div>
        </div>
      </noscript>
    </div>
  );
}

export default Hero3DMonolith;