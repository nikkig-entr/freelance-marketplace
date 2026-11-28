'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

interface Hero3DMonolithProps {
  /** Scroll progress from 0 to 1 (driven by Lenis) */
  scrollProgress?: number;
  /** Pointer position for magnetic interaction */
  pointer?: { x: number; y: number } | null;
  /** Container width */
  width?: number;
  /** Container height */
  height?: number;
  /** Reduced motion preference */
  reduceMotion?: boolean;
}

export function Hero3DMonolith({
  scrollProgress = 0,
  pointer = null,
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
  const blocksRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Monolith configuration - centered, larger, fewer blocks for clarity
  const config = useMemo(() => ({
    blockCount: width < 768 ? 18 : 32,
    cols: width < 768 ? 3 : 4,
    rows: width < 768 ? 3 : 4,
    layers: 2,
    baseBlockSize: Math.min(width, height) * 0.052, // ~52% of viewport height distributed
    spacing: 2.2,
    maxExplosion: 2.0,
    pointerInfluence: width < 768 ? 300 : 420,
    pointerForce: width < 768 ? 160 : 240,
  }), [width, height]);

  // Initialize Three.js scene
  const initializeScene = () => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const w = rect.width || width;
    const h = rect.height || height;
    const newDpr = Math.min(window.devicePixelRatio || 1, 2);

    // Renderer - alpha true for transparency, antialias for crisp edges
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current!,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });
    renderer.setSize(w, h);
    renderer.setPixelRatio(newDpr);
    renderer.setClearColor(0x050505, 0); // Transparent, page background shows through
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera - narrow FOV for architectural perspective, positioned to center monolith
    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 10000);
    camera.position.set(0, h * 0.15, Math.max(w, h) * 1.3);
    camera.lookAt(0, h * 0.25, 0);
    cameraRef.current = camera;

    // Monolith group - CENTERED in viewport at (0, 0.25, 0)
    const monolith = new THREE.Group();
    monolith.position.set(0, h * 0.25, 0);
    scene.add(monolith);
    monolithRef.current = monolith;

    // Materials - HIGH CONTRAST architectural materials for #050505 background
    const faceMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      emissive: 0x111111,
      roughness: 0.25,
      metalness: 0.75,
      side: THREE.DoubleSide,
    });

    // Bright white edge wireframes
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
      linewidth: 2,
    });

    const hoverEdgeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
      linewidth: 3,
    });

    // LIGHTING - Strong, architectural lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main key light - strong white directional
    const keyLight = new THREE.DirectionalLight(0xffffff, 4.0);
    keyLight.position.set(150, 400, 250);
    keyLight.castShadow = false;
    scene.add(keyLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.8);
    fillLight.position.set(-250, 150, -200);
    scene.add(fillLight);

    // Rim light for edge definition
    const rimLight = new THREE.DirectionalLight(0xffffff, 2.2);
    rimLight.position.set(0, -300, -350);
    scene.add(rimLight);

    // Point light for close-range brilliance
    const pointLight = new THREE.PointLight(0xffffff, 3.5, 25);
    pointLight.position.set(0, 80, 120);
    scene.add(pointLight);

    // Secondary point light for depth
    const pointLight2 = new THREE.PointLight(0xffffff, 2.0, 30);
    pointLight2.position.set(-100, 120, -80);
    scene.add(pointLight2);

    // Geometry - BoxGeometry for sharp architectural blocks
    const blockGeometry = new THREE.BoxGeometry(1, 1, 1);

    // Generate blocks - fewer, larger, centered
    const blocks: THREE.Mesh[] = [];
    const { blockCount, cols, rows, layers, baseBlockSize, spacing } = config;
    const blockSize = baseBlockSize;
    const spacingDist = blockSize * spacing;
    const startX = -(cols - 1) * spacingDist * 0.5;
    const startY = -(rows - 1) * spacingDist * 0.5;

    let telemetryCounter = 1;

    for (let layer = 0; layer < layers; layer++) {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (blocks.length >= blockCount) break;

          // Clean grid positions (no jitter for architectural precision)
          const x = startX + col * spacingDist;
          const y = startY + row * spacingDist;
          const z = layer * spacingDist * 1.8;

          const sizeVariation = 0.95 + Math.random() * 0.1; // Subtle variation

          // Create mesh with high-contrast material
          const mesh = new THREE.Mesh(blockGeometry, faceMaterial.clone());
          mesh.scale.set(blockSize * sizeVariation, blockSize * sizeVariation, blockSize * sizeVariation);
          mesh.position.set(x, y, z);

          // Store base position for physics
          mesh.userData = {
            baseX: x,
            baseY: y,
            baseZ: z,
            baseScale: blockSize * sizeVariation,
            telemetry: String(telemetryCounter++).padStart(2, '0'),
            velocity: new THREE.Vector3(),
            veinSeed: Math.random() * 1000,
            edgeMaterial: edgeMaterial.clone(),
            hoverEdgeMaterial: hoverEdgeMaterial.clone(),
            isHovered: false,
            originalOpacity: 0.92,
          };

          // Add crisp wireframe edges
          const edges = new THREE.EdgesGeometry(blockGeometry);
          const wireframe = new THREE.LineSegments(edges, mesh.userData.edgeMaterial);
          wireframe.scale.copy(mesh.scale);
          wireframe.position.copy(mesh.position);
          mesh.add(wireframe);

          monolith.add(mesh);
          blocks.push(mesh);
        }
      }
    }

    // Add two orbital rings around the monolith
    const ringGeometry = new THREE.RingGeometry(
      spacingDist * cols * 0.65,
      spacingDist * cols * 0.72,
      64
    );
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide,
    });

    // Ring 1 - horizontal
    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial.clone());
    ring1.rotation.x = -Math.PI / 2;
    ring1.position.y = 0;
    monolith.add(ring1);

    // Ring 2 - tilted
    const ring2 = new THREE.Mesh(ringGeometry, ringMaterial.clone());
    ring2.rotation.x = -Math.PI / 2;
    ring2.rotation.z = Math.PI / 6;
    ring2.position.y = 20;
    monolith.add(ring2);

    // Ring 3 - opposite tilt
    const ring3 = new THREE.Mesh(ringGeometry, ringMaterial.clone());
    ring3.rotation.x = -Math.PI / 2;
    ring3.rotation.z = -Math.PI / 6;
    ring3.position.y = -20;
    monolith.add(ring3);

    // Store rings for animation
    monolith.userData = {
      rings: [ring1, ring2, ring3],
    };

    blocksRef.current = blocks;
    setIsInitialized(true);
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
    const newDpr = Math.min(window.devicePixelRatio || 1, 2);

    camera.aspect = w / h;
    camera.position.set(0, h * 0.15, Math.max(w, h) * 1.3);
    camera.lookAt(0, h * 0.25, 0);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(newDpr);

    // Update monolith vertical position
    const monolith = monolithRef.current;
    if (monolith) {
      monolith.position.y = h * 0.25;
    }
  };

  // Animation loop
  const animate = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const monolith = monolithRef.current;
    const blocks = blocksRef.current;

    if (!renderer || !scene || !camera || !monolith || !blocks.length) return;

    timeRef.current += 1 / 60;

    // Scroll-driven explosion factor
    const explosionFactor = Math.min(config.maxExplosion, scrollProgress * config.maxExplosion * 1.1);

    // Camera subtle rotation based on scroll
    const scrollRotX = scrollProgress * 0.06;
    const scrollRotY = scrollProgress * 0.03;

    // Pointer interaction
    let pointerRotX = 0;
    let pointerRotY = 0;
    if (pointer && !reduceMotion) {
      pointerRotX = (pointer.y / (height * 0.5)) * 0.12;
      pointerRotY = (pointer.x / (width * 0.5)) * -0.12;
    }

    // Smooth monolith rotation
    const targetRotX = scrollRotX + pointerRotX;
    const targetRotY = scrollRotY + pointerRotY;
    monolith.rotation.x += (targetRotX - monolith.rotation.x) * 0.07;
    monolith.rotation.y += (targetRotY - monolith.rotation.y) * 0.07;

    // Subtle continuous rotation when idle
    if (!pointer && reduceMotion === false) {
      monolith.rotation.y += 0.00012;
      monolith.rotation.x += 0.00006;
    }

    // Animate orbital rings
    const rings = monolith.userData?.rings as THREE.Mesh[] | undefined;
    if (rings && !reduceMotion) {
      rings.forEach((ring, i) => {
        const speed = 0.00008 * (i + 1) * (i === 0 ? 1 : i === 1 ? 0.7 : 0.5);
        ring.rotation.z += speed * (i % 2 === 0 ? 1 : -1);
        ring.rotation.x = -Math.PI / 2 + Math.sin(timeRef.current * 0.3 + i) * 0.05;
        const ringMat = ring.material as THREE.MeshBasicMaterial;
        ringMat.opacity = 0.12 + 0.05 * Math.sin(timeRef.current * 0.5 + i);
      });
    }

    // Update each block with physics
    blocks.forEach((mesh) => {
      const data = mesh.userData;

      // Explosion offset - radial from center
      const radialDist = Math.sqrt(data.baseX * data.baseX + data.baseY * data.baseY);
      const radialAngle = Math.atan2(data.baseY, data.baseX);
      const explodeX = Math.cos(radialAngle) * radialDist * explosionFactor * 1.2;
      const explodeY = Math.sin(radialAngle) * radialDist * explosionFactor * 1.2;
      const explodeZ = Math.abs(data.baseZ) * explosionFactor * 0.8 + data.baseScale * explosionFactor * 3;

      // Pointer magnetic repulsion
      let repulseX = 0;
      let repulseY = 0;
      let repulseZ = 0;
      let isHovered = false;

      if (pointer && !reduceMotion) {
        const dx = mesh.position.x - pointer.x * 0.4;
        const dy = mesh.position.y - pointer.y * 0.4;
        const dist2D = Math.sqrt(dx * dx + dy * dy);
        const influenceRadius = config.pointerInfluence;

        if (dist2D < influenceRadius) {
          const force = (1 - dist2D / influenceRadius) * config.pointerForce;
          const angle = Math.atan2(dy, dx);
          repulseX = Math.cos(angle) * force;
          repulseY = Math.sin(angle) * force;
          repulseZ = force * 0.7;
          isHovered = dist2D < influenceRadius * 0.3;
        }
      }

      data.isHovered = isHovered;

      // Spring physics - snappy response
      const springK = 0.065;
      const damping = 0.8;

      const targetX = data.baseX + explodeX;
      const targetY = data.baseY + explodeY;
      const targetZ = data.baseZ + explodeZ;

      data.velocity.x += (targetX - mesh.position.x + repulseX) * springK;
      data.velocity.y += (targetY - mesh.position.y + repulseY) * springK;
      data.velocity.z += (targetZ - mesh.position.z + repulseZ) * springK;

      data.velocity.x *= damping;
      data.velocity.y *= damping;
      data.velocity.z *= damping;

      mesh.position.x += data.velocity.x;
      mesh.position.y += data.velocity.y;
      mesh.position.z += data.velocity.z;

      // Update wireframe position and opacity
      mesh.children.forEach((child) => {
        if (child instanceof THREE.LineSegments) {
          child.position.copy(mesh.position);
          child.rotation.copy(mesh.rotation);

          const mat = child.material as THREE.LineBasicMaterial;
          if (isHovered) {
            mat.opacity = 1.0;
            mat.color.setHex(0xffffff);
          } else {
            mat.opacity = 0.75 + 0.2 * Math.min(1, mesh.position.z / 800);
            mat.color.setHex(0xffffff);
          }
        }
      });

      // Subtle block rotation from velocity
      mesh.rotation.x += data.velocity.y * 0.0006;
      mesh.rotation.y += -data.velocity.x * 0.0006;
    });

    // Sort blocks by depth for proper transparency
    blocks.sort((a, b) => b.position.z - a.position.z);

    // Subtle scene breathing
    if (!reduceMotion) {
      monolith.position.y = Math.sin(timeRef.current * 0.12) * 1.5 + (containerRef.current ? containerRef.current.getBoundingClientRect().height * 0.25 : 0);
    }

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

    // Start animation
    animate();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
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
            obj.material.forEach(m => m.dispose());
          }
        }
        if (obj instanceof THREE.LineSegments) {
          obj.geometry.dispose();
          if (obj.material instanceof THREE.Material) {
            obj.material.dispose();
          }
        }
      });
    };
  }, [width, height, scrollProgress, pointer, reduceMotion]);

  // Re-initialize when container size changes significantly
  useEffect(() => {
    if (isInitialized) {
      handleResize();
    }
  }, [width, height, isInitialized]);

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
      {/* Fallback for no WebGL */}
      <noscript>
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg)]">
          <div className="text-center p-8">
            <svg width="64" height="64" viewBox="0 0 48 48" fill="none" className="mx-auto mb-6 opacity-50" stroke="currentColor" strokeWidth="1.5">
              <circle cx="24" cy="24" r="20" />
              <line x1="24" y1="8" x2="24" y2="40" />
              <line x1="8" y1="24" x2="40" y2="24" />
              <line x1="13" y1="13" x2="35" y2="35" />
              <line x1="35" y1="13" x2="13" y2="35" />
              <rect x="21" y="21" width="6" height="6" rx="1" />
            </svg>
            <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">
              WebGL required for 3D monolith
            </p>
          </div>
        </div>
      </noscript>
    </div>
  );
}

export default Hero3DMonolith;