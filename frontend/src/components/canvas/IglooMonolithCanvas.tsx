'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface Block {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  size: number;
  // 3D face colors for directional lighting
  faceColors: {
    top: string;
    right: string;
    front: string;
  };
  wireframeColor: string;
  telemetry: string;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
  // Rotation for 3D tilt
  rotX: number;
  rotY: number;
  rotZ: number;
  // Vein pattern seed
  veinSeed: number;
}

interface CameraState {
  scrollY: number;
  pointer: { x: number; y: number } | null;
  targetRotX: number;
  targetRotY: number;
  explosionFactor: number;
}

export function IglooMonolithCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const blocksRef = useRef<Block[]>([]);
  const cameraRef = useRef<CameraState>({
    scrollY: 0,
    pointer: null,
    targetRotX: 0,
    targetRotY: 0,
    explosionFactor: 0,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [dpr, setDpr] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const timeRef = useRef(0);

  // Generate monolith blocks - 12 distinct architectural blocks
  const generateBlocks = useCallback((w: number, h: number, mobile: boolean) => {
    const blocks: Block[] = [];
    const blockCount = 12; // Fixed 12 blocks for telemetry 01-12
    const cols = 4;
    const rows = 3;
    const layers = 1;

    const blockSize = Math.min(w, h) * (mobile ? 0.1 : 0.085);
    const spacing = blockSize * 1.6;
    const startX = -(cols - 1) * spacing * 0.5;
    const startY = -(rows - 1) * spacing * 0.5;
    const startZ = 0;

    let telemetryCounter = 1;

    for (let layer = 0; layer < layers; layer++) {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (blocks.length >= blockCount) break;

          const x = startX + col * spacing + (Math.random() - 0.5) * spacing * 0.15;
          const y = startY + row * spacing + (Math.random() - 0.5) * spacing * 0.15;
          const z = startZ + layer * spacing * 1.5;

          blocks.push({
            x,
            y,
            z,
            baseX: x,
            baseY: y,
            baseZ: z,
            size: blockSize * (0.9 + Math.random() * 0.2),
            faceColors: {
              top: `rgba(42,42,42,0.95)`,     // Lit top face
              right: `rgba(15,15,15,0.9)`,     // Shadow right face
              front: `rgba(10,10,10,0.88)`,    // Shadow front face
            },
            wireframeColor: 'rgba(255,255,255,0.85)',
            telemetry: String(telemetryCounter++).padStart(2, '0'),
            velocityX: 0,
            velocityY: 0,
            velocityZ: 0,
            rotX: 0,
            rotY: 0,
            rotZ: 0,
            veinSeed: Math.random() * 1000,
          });
        }
      }
    }

    return blocks;
  }, []);

  // Resize handler using ResizeObserver on container
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const newWidth = rect.width;
    const newHeight = rect.height;
    const newDpr = Math.min(window.devicePixelRatio || 1, 2);
    const newIsMobile = newWidth < 768;

    canvas.width = newWidth * newDpr;
    canvas.height = newHeight * newDpr;
    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;

    setContainerWidth(newWidth);
    setContainerHeight(newHeight);
    setDpr(newDpr);
    setIsMobile(newIsMobile);

    // Regenerate blocks for new dimensions
    blocksRef.current = generateBlocks(newWidth, newHeight, newIsMobile);
  }, [generateBlocks]);

  // Scroll handler for fragmentation
  const handleScroll = useCallback(() => {
    const camera = cameraRef.current;
    camera.scrollY = window.scrollY;
    // Explosion factor based on scroll (0 to ~1.5)
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    camera.explosionFactor = Math.min(1.5, (camera.scrollY / maxScroll) * 3);
  }, []);

  // Mouse move handler for pointer tilt
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.5;

    const camera = cameraRef.current;
    camera.pointer = {
      x: e.clientX - cx,
      y: e.clientY - cy,
    };

    // Target rotation based on pointer position (max ±15°)
    camera.targetRotX = (camera.pointer.y / (rect.height * 0.5)) * 0.26; // ~15° in radians
    camera.targetRotY = (camera.pointer.x / (rect.width * 0.5)) * -0.26;
  }, []);

  // Touch handlers - passive so scrolling is NEVER blocked
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.5;
    const touch = e.touches[0];

    const camera = cameraRef.current;
    camera.pointer = {
      x: touch.clientX - cx,
      y: touch.clientY - cy,
    };
    camera.targetRotX = (camera.pointer.y / (rect.height * 0.5)) * 0.26;
    camera.targetRotY = (camera.pointer.x / (rect.width * 0.5)) * -0.26;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const cx = rect.left + rect.width * 0.5;
    const cy = rect.top + rect.height * 0.5;
    const touch = e.touches[0];

    const camera = cameraRef.current;
    camera.pointer = {
      x: touch.clientX - cx,
      y: touch.clientY - cy,
    };
    camera.targetRotX = (camera.pointer.y / (rect.height * 0.5)) * 0.26;
    camera.targetRotY = (camera.pointer.x / (rect.width * 0.5)) * -0.26;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const camera = cameraRef.current;
    camera.pointer = null;
    camera.targetRotX = 0;
    camera.targetRotY = 0;
  }, []);

  // Initialize
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initial setup
    handleResize();

    // ResizeObserver for container size changes
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handleResize, handleScroll, handleMouseMove, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // 3D Projection math with rotation
  const project3D = (block: Block, cx: number, cy: number, focalLength: number, camRotX: number, camRotY: number) => {
    // Apply camera rotation
    let px = block.x;
    let py = block.y;
    let pz = block.z;

    // Rotate around Y (camRotY)
    const cosY = Math.cos(camRotY);
    const sinY = Math.sin(camRotY);
    const rx = px * cosY - pz * sinY;
    const rz = px * sinY + pz * cosY;
    px = rx;
    pz = rz;

    // Rotate around X (camRotX)
    const cosX = Math.cos(camRotX);
    const sinX = Math.sin(camRotX);
    const ry = py * cosX - pz * sinX;
    const rz2 = py * sinX + pz * cosX;
    py = ry;
    pz = rz2;

    pz += focalLength;

    if (pz <= 0) return null;

    const scale = focalLength / pz;
    const x2d = cx + px * scale;
    const y2d = cy + py * scale;
    const size2d = block.size * scale;

    return { x: x2d, y: y2d, size: size2d, depth: pz, scale, px, py, pz };
  };

  // Draw architectural vein lines on face
  const drawVeins = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, seed: number, scale: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    const veinCount = 3 + Math.floor(seed * 2) % 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.5 / scale;

    for (let i = 0; i < veinCount; i++) {
      const angle = (seed * 137.5 + i * 89) * Math.PI / 180; // Golden angle
      const length = size * 0.6;
      const startAngle = angle + Math.sin(timeRef.current * 0.0002 + seed + i) * 0.1;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let t = 0; t <= 1; t += 0.1) {
        const noise = Math.sin(t * 10 + seed + i * 7) * 0.15;
        const x = Math.cos(startAngle) * length * t * (1 + noise);
        const y = Math.sin(startAngle) * length * t * (1 + noise);
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.restore();
  };

  // Draw volumetric light rays for hovered blocks
  const drawVolumetricLight = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, _scale: number, intensity: number) => {
    if (intensity < 0.1) return;

    const beamCount = 4;
    for (let i = 0; i < beamCount; i++) {
      const angle = (i / beamCount) * Math.PI * 2 + timeRef.current * 0.0003;
      const beamLength = size * 2.5;
      const beamWidth = size * 0.25;

      const gradient = ctx.createLinearGradient(
        x, y,
        x + Math.cos(angle) * beamLength,
        y + Math.sin(angle) * beamLength
      );
      gradient.addColorStop(0, `rgba(255,255,255,${0.15 * intensity})`);
      gradient.addColorStop(0.5, `rgba(255,255,255,${0.05 * intensity})`);
      gradient.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = gradient;
      ctx.fillRect(-beamWidth * 0.5, -size * 1.5, beamWidth, size * 3);
      ctx.restore();
    }
  };

  // Draw a single block with full 3D faces, veins, wireframe
  const drawBlock = (ctx: CanvasRenderingContext2D, block: Block, projected: ReturnType<typeof project3D>, isHovered: boolean, camRotX: number, camRotY: number) => {
    if (!projected) return;

    const { x, y, size, depth, scale } = projected;
    const half = size * 0.5;
    const faceOffset = size * 0.18;
    const topY = y - half - faceOffset;
    const rightX = x + half + faceOffset;

    // Depth-based opacity
    const depthOpacity = Math.max(0.2, Math.min(1, 1 - depth / 4000));

    // Calculate face visibility based on camera rotation
    const showTop = camRotX > -0.3; // Show top unless looking steeply down
    const showRight = camRotY < 0.3; // Show right unless looking from right

    // Draw faces (right, top, front) - back to front
    // Right face
    if (showRight) {
      ctx.beginPath();
      ctx.moveTo(x + half, y - half);
      ctx.lineTo(rightX, topY);
      ctx.lineTo(rightX, y + half - faceOffset);
      ctx.lineTo(x + half, y + half);
      ctx.closePath();
      ctx.fillStyle = block.faceColors.right.replace('0.9', String(0.9 * depthOpacity));
      ctx.fill();

      // Veins on right face
      drawVeins(ctx, rightX - faceOffset * 0.5, y - faceOffset * 0.5, size, block.veinSeed + 1, scale);
    }

    // Top face
    if (showTop) {
      ctx.beginPath();
      ctx.moveTo(x - half, y - half);
      ctx.lineTo(x + half, y - half);
      ctx.lineTo(rightX, topY);
      ctx.lineTo(x - half + faceOffset, topY);
      ctx.closePath();
      ctx.fillStyle = block.faceColors.top.replace('0.95', String(0.95 * depthOpacity));
      ctx.fill();

      // Veins on top face (more prominent)
      drawVeins(ctx, x, y - half - faceOffset * 0.5, size, block.veinSeed, scale);
    }

    // Front face
    ctx.beginPath();
    ctx.rect(x - half, y - half, size, size);
    ctx.fillStyle = block.faceColors.front.replace('0.88', String(0.88 * depthOpacity));
    ctx.fill();

    // Wireframe edges - CRISP WHITE STROKES
    const isLit = isHovered || (scale > 0.4 && depth < 2000);
    if (isLit) {
      ctx.strokeStyle = block.wireframeColor;
      ctx.lineWidth = Math.max(1.5, 2.2 * scale);
      ctx.globalAlpha = isHovered ? 1 : 0.7;
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = Math.max(0.8, 1.2 * scale);
      ctx.globalAlpha = 0.4;
    }

    // Front face edges
    ctx.beginPath();
    ctx.rect(x - half, y - half, size, size);
    ctx.stroke();

    // Right face edges
    if (showRight) {
      ctx.beginPath();
      ctx.moveTo(x + half, y - half);
      ctx.lineTo(rightX, topY);
      ctx.lineTo(rightX, y + half - faceOffset);
      ctx.lineTo(x + half, y + half);
      ctx.stroke();
    }

    // Top face edges
    if (showTop) {
      ctx.beginPath();
      ctx.moveTo(x - half, y - half);
      ctx.lineTo(rightX, topY);
      ctx.lineTo(x - half + faceOffset, topY);
      ctx.lineTo(x - half, y - half);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;

    // Volumetric light beams for hovered blocks
    if (isHovered) {
      drawVolumetricLight(ctx, x, y, size, scale, 1);
    }

    // Telemetry tag
    if (isHovered || (scale > 0.35 && depth < 1800)) {
      ctx.fillStyle = isHovered ? '#FFFFFF' : 'rgba(255,255,255,0.55)';
      ctx.font = `${Math.max(9, 11 * scale)}px 'JetBrains Mono', 'Fira Code', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(block.telemetry, x, y + half + 16 * scale);
    }
  };

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = containerWidth;
    const h = containerHeight;
    const cx = w * 0.5;
    const cy = h * 0.5;
    const focalLength = Math.max(w, h) * 1.4;

    timeRef.current += 16.67;

    // Clear with dark background
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w * dpr, h * dpr);
    ctx.scale(dpr, dpr);

    const camera = cameraRef.current;

    // Smooth camera rotation interpolation
    const currentRotX = camera.targetRotX * 0.1; // Dampened for subtle effect
    const currentRotY = camera.targetRotY * 0.1;

    // Apply scroll-driven explosion to blocks
    const explosionFactor = camera.explosionFactor;

    // Project all blocks with spring physics
    const projectedBlocks = blocksRef.current
      .map(block => {
        // Scroll-driven explosion: blocks move apart radially and vertically
        const radialDist = Math.sqrt(block.baseX * block.baseX + block.baseY * block.baseY);
        const radialAngle = Math.atan2(block.baseY, block.baseX);

        const explodeX = Math.cos(radialAngle) * radialDist * explosionFactor * 0.8;
        const explodeY = Math.sin(radialAngle) * radialDist * explosionFactor * 0.8;
        const explodeZ = Math.abs(block.baseZ) * explosionFactor * 0.5 + block.size * explosionFactor * 2;

        // Pointer repulsion
        let repulseX = 0;
        let repulseY = 0;
        let repulseZ = 0;
        let isHovered = false;

        if (camera.pointer) {
          const dx = block.x - camera.pointer.x;
          const dy = block.y - camera.pointer.y;
          const dist2D = Math.sqrt(dx * dx + dy * dy);
          const influenceRadius = isMobile ? 220 : 320;

          if (dist2D < influenceRadius) {
            const force = (1 - dist2D / influenceRadius) * (isMobile ? 100 : 150);
            const angle = Math.atan2(dy, dx);
            repulseX = Math.cos(angle) * force;
            repulseY = Math.sin(angle) * force;
            repulseZ = force * 0.6;
            isHovered = dist2D < influenceRadius * 0.35;
          }
        }

        // Spring physics back to base position (with explosion offset)
        const springK = 0.07;
        const damping = 0.82;

        const targetX = block.baseX + explodeX;
        const targetY = block.baseY + explodeY;
        const targetZ = block.baseZ + explodeZ;

        block.velocityX += (targetX - block.x + repulseX) * springK;
        block.velocityY += (targetY - block.y + repulseY) * springK;
        block.velocityZ += (targetZ - block.z + repulseZ) * springK;

        block.velocityX *= damping;
        block.velocityY *= damping;
        block.velocityZ *= damping;

        block.x += block.velocityX;
        block.y += block.velocityY;
        block.z += block.velocityZ;

        // Subtle block rotation based on velocity
        block.rotX *= 0.95;
        block.rotY *= 0.95;
        block.rotZ *= 0.95;
        block.rotX += block.velocityY * 0.001;
        block.rotY += -block.velocityX * 0.001;

        return { block, isHovered };
      })
      .sort((a, b) => (b.block.z + b.block.velocityZ) - (a.block.z + a.block.velocityZ)); // Painter's algorithm

    // Draw all blocks
    for (const { block, isHovered } of projectedBlocks) {
      const projected = project3D(block, cx, cy, focalLength, currentRotX, currentRotY);
      if (projected) {
        drawBlock(ctx, block, projected, isHovered, currentRotX, currentRotY);
      }
    }

    // Subtle architectural grid on floor plane
    ctx.strokeStyle = 'rgba(255,255,255,0.015)';
    ctx.lineWidth = 0.5;
    const gridSize = 80;
    const gridOffset = (timeRef.current * 0.008) % gridSize;

    for (let x = -gridOffset; x < w + gridSize; x += gridSize) {
      const perspective = 1 - Math.abs(x - cx) / (w * 0.7);
      ctx.globalAlpha = 0.015 * Math.max(0.1, perspective);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (cx - x) * 0.15 * Math.sin(timeRef.current * 0.0004), h);
      ctx.stroke();
    }

    for (let y = -gridOffset; y < h + gridSize; y += gridSize) {
      const perspective = 1 - Math.abs(y - cy) / (h * 0.7);
      ctx.globalAlpha = 0.012 * Math.max(0.1, perspective);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + (cy - y) * 0.1 * Math.cos(timeRef.current * 0.0003));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Vignette
    const vignette = ctx.createRadialGradient(
      cx, cy, 0,
      cx, cy, Math.max(w, h) * 0.75
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // Subtle scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.015)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y + (Math.floor(timeRef.current * 0.08) % 4), w, 1);
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [dpr, containerWidth, containerHeight, isMobile]);

  // Start animation
  useEffect(() => {
    if (containerWidth > 0 && containerHeight > 0) {
      animate();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, containerWidth, containerHeight]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full block"
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ touchAction: 'auto' }}
      />
    </div>
  );
}

export { IglooMonolithCanvas as default };