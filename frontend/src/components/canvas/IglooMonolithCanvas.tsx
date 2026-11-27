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
  color: string;
  wireframeColor: string;
  telemetry: string;
  velocityX: number;
  velocityY: number;
  velocityZ: number;
}

export function IglooMonolithCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const blocksRef = useRef<Block[]>([]);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dpr, setDpr] = useState(1);
  const timeRef = useRef(0);
  const widthRef = useRef(0);
  const heightRef = useRef(0);

  // Generate monolith blocks
  const generateBlocks = useCallback((w: number, h: number, mobile: boolean) => {
    const blocks: Block[] = [];
    const blockCount = mobile ? 28 : 48;
    const cols = mobile ? 4 : 6;
    const rows = mobile ? 4 : 5;
    const layers = mobile ? 2 : 3;

    const blockSize = Math.min(w, h) * (mobile ? 0.08 : 0.06);
    const spacing = blockSize * 1.4;
    const startX = -(cols - 1) * spacing * 0.5;
    const startY = -(rows - 1) * spacing * 0.5;
    const startZ = -(layers - 1) * spacing * 0.5;

    let telemetryCounter = 1;

    for (let layer = 0; layer < layers; layer++) {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (blocks.length >= blockCount) break;

          const x = startX + col * spacing + (Math.random() - 0.5) * spacing * 0.3;
          const y = startY + row * spacing + (Math.random() - 0.5) * spacing * 0.3;
          const z = startZ + layer * spacing * 1.2;

          blocks.push({
            x,
            y,
            z,
            baseX: x,
            baseY: y,
            baseZ: z,
            size: blockSize * (0.85 + Math.random() * 0.3),
            color: '#050505',
            wireframeColor: '#FFFFFF',
            telemetry: String(telemetryCounter++).padStart(2, '0'),
            velocityX: 0,
            velocityY: 0,
            velocityZ: 0,
          });
        }
      }
    }

    return blocks;
  }, []);

  // Resize handler
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    const newDpr = Math.min(window.devicePixelRatio || 1, 2);
    const newIsMobile = window.innerWidth < 768;

    canvas.width = newWidth * newDpr;
    canvas.height = newHeight * newDpr;
    canvas.style.width = `${newWidth}px`;
    canvas.style.height = `${newHeight}px`;

    widthRef.current = newWidth;
    heightRef.current = newHeight;
    setDpr(newDpr);
    setIsMobile(newIsMobile);

    // Regenerate blocks for new dimensions
    blocksRef.current = generateBlocks(newWidth, newHeight, newIsMobile);
  }, [generateBlocks]);

  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setPointer({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  // Touch handlers - passive so scrolling is NEVER blocked
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    setPointer({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    setPointer({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  }, []);

  const handleTouchEnd = useCallback(() => {
    setPointer(null);
  }, []);

  // Initialize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initial setup
    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [handleResize, handleMouseMove, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // 3D Projection math
  const project3D = (block: Block, cx: number, cy: number, focalLength: number) => {
    const px = block.x;
    const py = block.y;
    const pz = block.z + focalLength;

    if (pz <= 0) return null;

    const scale = focalLength / pz;
    const x2d = cx + px * scale;
    const y2d = cy + py * scale;
    const size2d = block.size * scale;

    return { x: x2d, y: y2d, size: size2d, depth: pz, scale };
  };

  // Draw a single block with wireframe edges
  const drawBlock = (ctx: CanvasRenderingContext2D, block: Block, projected: ReturnType<typeof project3D>, isHovered: boolean) => {
    if (!projected) return;

    const { x, y, size, depth } = projected;
    const half = size * 0.5;

    // Isometric-ish 3D box faces
    const faceOffset = size * 0.15;
    const topY = y - half - faceOffset;
    const rightX = x + half + faceOffset;

    // Depth-based opacity
    const depthOpacity = Math.max(0.15, Math.min(1, 1 - depth / 3000));

    // Draw faces (right, top, front) - monochrome architectural volumes
    // Right face
    ctx.beginPath();
    ctx.moveTo(x + half, y - half);
    ctx.lineTo(rightX, topY);
    ctx.lineTo(rightX, y + half - faceOffset);
    ctx.lineTo(x + half, y + half);
    ctx.closePath();
    ctx.fillStyle = `rgba(255,255,255,${0.02 * depthOpacity})`;
    ctx.fill();

    // Top face
    ctx.beginPath();
    ctx.moveTo(x - half, y - half);
    ctx.lineTo(x + half, y - half);
    ctx.lineTo(rightX, topY);
    ctx.lineTo(x - half + faceOffset, topY);
    ctx.closePath();
    ctx.fillStyle = `rgba(255,255,255,${0.04 * depthOpacity})`;
    ctx.fill();

    // Front face
    ctx.beginPath();
    ctx.rect(x - half, y - half, size, size);
    ctx.fillStyle = `rgba(255,255,255,${0.015 * depthOpacity})`;
    ctx.fill();

    // Wireframe edges - CRISP WHITE STROKES
    if (isHovered) {
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = Math.max(1, 2 * projected.scale);
      ctx.globalAlpha = 0.9;
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = Math.max(0.5, 1 * projected.scale);
      ctx.globalAlpha = 0.4;
    }

    // Front face edges
    ctx.beginPath();
    ctx.rect(x - half, y - half, size, size);
    ctx.stroke();

    // Right face edges
    ctx.beginPath();
    ctx.moveTo(x + half, y - half);
    ctx.lineTo(rightX, topY);
    ctx.lineTo(rightX, y + half - faceOffset);
    ctx.lineTo(x + half, y + half);
    ctx.stroke();

    // Top face edges
    ctx.beginPath();
    ctx.moveTo(x - half, y - half);
    ctx.lineTo(rightX, topY);
    ctx.lineTo(rightX, y + half - faceOffset);
    ctx.lineTo(x - half, y + half);
    ctx.stroke();

    ctx.globalAlpha = 1;

    // Volumetric light beams for hovered blocks
    if (isHovered) {
      const beamCount = 3;
      for (let i = 0; i < beamCount; i++) {
        const angle = (i / beamCount) * Math.PI * 2 + timeRef.current * 0.001;
        const beamLength = size * 3;
        const beamWidth = size * 0.3;

        const gradient = ctx.createLinearGradient(
          x, y,
          x + Math.cos(angle) * beamLength,
          y + Math.sin(angle) * beamLength
        );
        gradient.addColorStop(0, 'rgba(255,255,255,0.12)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.04)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = gradient;
        ctx.fillRect(-beamWidth * 0.5, -size * 2, beamWidth, size * 4);
        ctx.restore();
      }
    }

    // Telemetry tag
    if (isHovered || (projected.scale > 0.3 && depth < 1500)) {
      ctx.fillStyle = isHovered ? '#FFFFFF' : 'rgba(255,255,255,0.5)';
      ctx.font = `${Math.max(8, 10 * projected.scale)}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(block.telemetry, x, y + half + 12 * projected.scale);
    }
  };

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = widthRef.current;
    const h = heightRef.current;
    const cx = w * 0.5;
    const cy = h * 0.5;
    const focalLength = Math.max(w, h) * 1.2;

    timeRef.current += 16.67;

    // Clear
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, w * dpr, h * dpr);
    ctx.scale(dpr, dpr);

    // Ambient breathing motion on mobile when idle
    const ambientFactor = isMobile && !pointer ? Math.sin(timeRef.current * 0.0003) * 0.5 : 0;

    // Project all blocks
    const projectedBlocks = blocksRef.current
      .map(block => {
        // Apply ambient breathing
        const ambientX = ambientFactor * (block.baseX * 0.1);
        const ambientY = ambientFactor * (block.baseY * 0.1);
        const ambientZ = ambientFactor * (block.baseZ * 0.1);

        // Pointer repulsion
        let repulseX = 0;
        let repulseY = 0;
        let repulseZ = 0;
        let isHovered = false;

        if (pointer) {
          const dx = block.x - (pointer.x - cx);
          const dy = block.y - (pointer.y - cy);
          const dist2D = Math.sqrt(dx * dx + dy * dy);
          const influenceRadius = isMobile ? 200 : 300;

          if (dist2D < influenceRadius) {
            const force = (1 - dist2D / influenceRadius) * (isMobile ? 80 : 120);
            const angle = Math.atan2(dy, dx);
            repulseX = Math.cos(angle) * force;
            repulseY = Math.sin(angle) * force;
            repulseZ = force * 0.5;
            isHovered = dist2D < influenceRadius * 0.4;
          }
        }

        // Spring physics back to base position
        const springK = 0.08;
        const damping = 0.85;

        block.velocityX += (block.baseX - block.x + repulseX + ambientX) * springK;
        block.velocityY += (block.baseY - block.y + repulseY + ambientY) * springK;
        block.velocityZ += (block.baseZ - block.z + repulseZ + ambientZ) * springK;

        block.velocityX *= damping;
        block.velocityY *= damping;
        block.velocityZ *= damping;

        block.x += block.velocityX;
        block.y += block.velocityY;
        block.z += block.velocityZ;

        return { block, isHovered };
      })
      .sort((a, b) => (b.block.z + b.block.velocityZ) - (a.block.z + a.block.velocityZ)); // Painter's algorithm: back to front

    // Draw all blocks
    for (const { block, isHovered } of projectedBlocks) {
      const projected = project3D(block, cx, cy, focalLength);
      if (projected) {
        drawBlock(ctx, block, projected, isHovered);
      }
    }

    // Subtle architectural grid on floor plane
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 0.5;
    const gridSize = 80;
    const gridOffset = (timeRef.current * 0.01) % gridSize;

    for (let x = -gridOffset; x < w + gridSize; x += gridSize) {
      const perspective = 1 - Math.abs(x - cx) / (w * 0.6);
      ctx.globalAlpha = 0.02 * Math.max(0.1, perspective);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (cx - x) * 0.2 * Math.sin(timeRef.current * 0.0005), h);
      ctx.stroke();
    }

    for (let y = -gridOffset; y < h + gridSize; y += gridSize) {
      const perspective = 1 - Math.abs(y - cy) / (h * 0.6);
      ctx.globalAlpha = 0.015 * Math.max(0.1, perspective);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y + (cy - y) * 0.15 * Math.cos(timeRef.current * 0.0004));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Corner HUD metadata (drawn by React overlay, not here)
    // But we draw subtle scanline/vignette for cinematic feel
    // Vignette
    const vignette = ctx.createRadialGradient(
      cx, cy, 0,
      cx, cy, Math.max(w, h) * 0.7
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    // Subtle scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.02)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y + (Math.floor(timeRef.current * 0.1) % 4), w, 1);
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [pointer, isMobile, dpr]);

  // Start animation
  useEffect(() => {
    animate();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      aria-hidden="true"
      style={{ touchAction: 'auto' }} // Allow native scrolling
    />
  );
}

export { IglooMonolithCanvas as default };