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

  // Monolith configuration
  const config = useMemo(() => ({
    blockCount: width < 768 ? 24 : 48,
    cols: width < 768 ? 4 : 8,
    rows: width < 768 ? 6 : 8,
    layers: 1,
    baseBlockSize: Math.min(width, height) * 0.045,
    spacing: 1.9,
    maxExplosion: 2.5,
    pointerInfluence: width < 768 ? 280 : 380,
    pointerForce: width < 768 ? 140 : 200,
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
    renderer.toneMappingExposure = 1.0;
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera - narrow FOV for architectural perspective
    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 10000);
    camera.position.set(0, 0, Math.max(w, h) * 1.6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Monolith group
    const monolith = new THREE.Group();
    scene.add(monolith);
    monolithRef.current = monolith;

    // Materials - Pure monochrome architectural materials
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
      depthTest: true,
      depthWrite: false,
    });

    const faceMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.95,
      metalness: 0.02,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
    });

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      linewidth: 2,
    });

    const hoverEdgeMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
      linewidth: 3,
    });

    // Lighting - Architectural, minimal
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 0.6);
    keyLight.position.set(200, 400, 300);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.15);
    fillLight.position.set(-300, 100, -200);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.25);
    rimLight.position.set(0, -300, -400);
    scene.add(rimLight);

    // Geometry - BoxGeometry for sharp architectural blocks
    const blockGeometry = new THREE.BoxGeometry(1, 1, 1);

    // Generate blocks
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

          // Slight position jitter for organic feel
          const x = startX + col * spacingDist + (Math.random() - 0.5) * spacingDist * 0.06;
          const y = startY + row * spacingDist + (Math.random() - 0.5) * spacingDist * 0.06;
          const z = layer * spacingDist * 1.6;

          const sizeVariation = 0.92 + Math.random() * 0.16;

          // Create mesh with wireframe
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
            wireframeMaterial: wireframeMaterial.clone(),
            edgeMaterial: edgeMaterial.clone(),
            hoverEdgeMaterial: hoverEdgeMaterial.clone(),
            isHovered: false,
            originalOpacity: 0.85,
          };

          // Add wireframe as separate mesh for crisp edges
          const edges = new THREE.EdgesGeometry(blockGeometry);
          const wireframe = new THREE.LineSegments(edges, mesh.userData.wireframeMaterial);
          wireframe.scale.copy(mesh.scale);
          wireframe.position.copy(mesh.position);
          mesh.add(wireframe);

          monolith.add(mesh);
          blocks.push(mesh);
        }
      }
    }

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
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(newDpr);
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
    const explosionFactor = Math.min(config.maxExplosion, scrollProgress * config.maxExplosion * 1.2);

    // Camera subtle rotation based on scroll
    const scrollRotX = scrollProgress * 0.08;
    const scrollRotY = scrollProgress * 0.04;

    // Pointer interaction
    let pointerRotX = 0;
    let pointerRotY = 0;
    if (pointer && !reduceMotion) {
      pointerRotX = (pointer.y / (height * 0.5)) * 0.15;
      pointerRotY = (pointer.x / (width * 0.5)) * -0.15;
    }

    // Smooth monolith rotation
    const targetRotX = scrollRotX + pointerRotX;
    const targetRotY = scrollRotY + pointerRotY;
    monolith.rotation.x += (targetRotX - monolith.rotation.x) * 0.08;
    monolith.rotation.y += (targetRotY - monolith.rotation.y) * 0.08;

    // Subtle continuous rotation when idle
    if (!pointer && reduceMotion === false) {
      monolith.rotation.y += 0.00015;
      monolith.rotation.x += 0.00008;
    }

    // Update each block with physics
    blocks.forEach((mesh) => {
      const data = mesh.userData;

      // Explosion offset
      const radialDist = Math.sqrt(data.baseX * data.baseX + data.baseY * data.baseY);
      const radialAngle = Math.atan2(data.baseY, data.baseX);
      const explodeX = Math.cos(radialAngle) * radialDist * explosionFactor * 1.3;
      const explodeY = Math.sin(radialAngle) * radialDist * explosionFactor * 1.3;
      const explodeZ = Math.abs(data.baseZ) * explosionFactor * 0.9 + data.baseScale * explosionFactor * 4;

      // Pointer magnetic repulsion
      let repulseX = 0;
      let repulseY = 0;
      let repulseZ = 0;
      let isHovered = false;

      if (pointer && !reduceMotion) {
        const dx = mesh.position.x - pointer.x * 0.5;
        const dy = mesh.position.y - pointer.y * 0.5;
        const dist2D = Math.sqrt(dx * dx + dy * dy);
        const influenceRadius = config.pointerInfluence;

        if (dist2D < influenceRadius) {
          const force = (1 - dist2D / influenceRadius) * config.pointerForce;
          const angle = Math.atan2(dy, dx);
          repulseX = Math.cos(angle) * force;
          repulseY = Math.sin(angle) * force;
          repulseZ = force * 0.8;
          isHovered = dist2D < influenceRadius * 0.35;
        }
      }

      data.isHovered = isHovered;

      // Spring physics
      const springK = 0.055;
      const damping = 0.82;

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

      // Update wireframe position
      mesh.children.forEach((child) => {
        if (child instanceof THREE.LineSegments) {
          child.position.copy(mesh.position);
          child.rotation.copy(mesh.rotation);

          // Update wireframe opacity based on hover
          const mat = child.material as THREE.MeshBasicMaterial;
          if (isHovered) {
            mat.opacity = 1.0;
            mat.color.setHex(0xffffff);
          } else {
            mat.opacity = 0.6 + 0.3 * Math.min(1, mesh.position.z / 1000);
            mat.color.setHex(0xffffff);
          }
        }
      });

      // Subtle block rotation from velocity
      mesh.rotation.x += data.velocity.y * 0.0008;
      mesh.rotation.y += -data.velocity.x * 0.0008;
    });

    // Sort blocks by depth for proper transparency (painter's algorithm)
    blocks.sort((a, b) => b.position.z - a.position.z);

    // Subtle scene breathing
    if (!reduceMotion) {
      monolith.position.y = Math.sin(timeRef.current * 0.15) * 2;
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
            <BrandLogo size={64} strokeWidth={1.5} className="mx-auto mb-6 opacity-50" />
            <p className="font-mono text-xs text-[var(--color-text-muted)] tracking-wider uppercase">
              WebGL required for 3D monolith
            </p>
          </div>
        </div>
      </noscript>
    </div>
  );
}

// Import BrandLogo for fallback
import { BrandLogo } from '@/components/ui/BrandLogo';

export default Hero3DMonolith;