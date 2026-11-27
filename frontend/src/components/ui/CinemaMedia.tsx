'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

interface CinemaMediaProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  poster?: string;
  muted?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  priority?: boolean;
  aspectRatio?: number;
}

export function CinemaMedia({
  src,
  alt = '',
  className = '',
  style = {},
  poster,
  muted = true,
  autoPlay = true,
  loop = true,
  playsInline = true,
  priority = false,
  aspectRatio = 16 / 9,
}: CinemaMediaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<number>();
  const [useCanvas, setUseCanvas] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const timeRef = useRef(0);

  const drawCinematicCanvas = useCallback((canvas: HTMLCanvasElement, time: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    const t = time * 0.001;

    // Cinematic light rays (architectural volumetric lighting)
    const rayCount = 6;
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + t * 0.08;
      const rayWidth = width * 0.15;
      const centerX = width * 0.5 + Math.sin(t * 0.3 + i * 1.7) * width * 0.15;
      const centerY = height * 0.5 + Math.cos(t * 0.25 + i * 2.1) * height * 0.1;

      const gradient = ctx.createLinearGradient(
        centerX, centerY,
        centerX + Math.cos(angle) * width * 1.5,
        centerY + Math.sin(angle) * height * 1.5
      );
      gradient.addColorStop(0, 'rgba(255,255,255,0.08)');
      gradient.addColorStop(0.3, 'rgba(255,255,255,0.03)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle);
      ctx.fillStyle = gradient;
      ctx.fillRect(-rayWidth * 0.5, -height, rayWidth, height * 2);
      ctx.restore();
    }

    // Architectural grid lines (subtle perspective grid)
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 0.5;
    const gridSize = 60;
    const gridOffsetX = (t * 15) % gridSize;
    const gridOffsetY = (t * 10) % gridSize;

    for (let x = -gridOffsetX; x < width + gridSize; x += gridSize) {
      const perspective = 1 - Math.abs(x - width * 0.5) / (width * 0.8);
      ctx.globalAlpha = 0.02 * Math.max(0.1, perspective);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (width * 0.5 - x) * 0.3 * Math.sin(t * 0.1), height);
      ctx.stroke();
    }

    for (let y = -gridOffsetY; y < height + gridSize; y += gridSize) {
      const perspective = 1 - Math.abs(y - height * 0.5) / (height * 0.8);
      ctx.globalAlpha = 0.015 * Math.max(0.1, perspective);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y + (height * 0.5 - y) * 0.2 * Math.cos(t * 0.08));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Floating architectural particles (dust motes in light)
    const particleCount = 40;
    for (let i = 0; i < particleCount; i++) {
      const seed = i * 12.9898;
      const px = (Math.sin(seed + t * 0.5) * 0.5 + 0.5) * width;
      const py = (Math.cos(seed * 1.3 + t * 0.3) * 0.5 + 0.5) * height;
      const size = 0.5 + Math.sin(seed * 2.1 + t) * 0.5;
      const alpha = 0.15 + Math.sin(seed * 3.7 + t * 1.3) * 0.1;

      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Film grain overlay
    const grainIntensity = 0.03;
    const grainSize = 2;
    for (let y = 0; y < height; y += grainSize) {
      for (let x = 0; x < width; x += grainSize) {
        const grain = Math.random() - 0.5;
        if (grain > 0.3) {
          ctx.fillStyle = `rgba(255,255,255,${grain * grainIntensity})`;
          ctx.fillRect(x, y, grainSize, grainSize);
        }
      }
    }

    // Subtle vignette
    const vignette = ctx.createRadialGradient(
      width * 0.5, height * 0.5, 0,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.7
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    // Scanline effect (subtle)
    ctx.fillStyle = 'rgba(0,0,0,0.02)';
    for (let y = 0; y < height; y += 4) {
      ctx.fillRect(0, y + (Math.floor(t * 100) % 4), width, 1);
    }
  }, []);

  const animateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !useCanvas) return;

    timeRef.current += 16.67; // ~60fps
    drawCinematicCanvas(canvas, timeRef.current);
    animationRef.current = requestAnimationFrame(animateCanvas);
  }, [drawCinematicCanvas, useCanvas]);

  useEffect(() => {
    if (useCanvas) {
      animateCanvas();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [useCanvas, animateCanvas]);

  const handleVideoError = useCallback(() => {
    setUseCanvas(true);
    setIsLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setUseCanvas(true);
    setIsLoaded(true);
  }, []);

  const handleVideoLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio,
    overflow: 'hidden',
    background: '#050505',
    ...style,
  };

  if (useCanvas) {
    return (
      <div className={className} style={containerStyle} aria-hidden="true">
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'block',
          }}
          aria-hidden="true"
        />
      </div>
    );
  }

  const isVideo = src.endsWith('.mp4') || src.endsWith('.webm') || src.endsWith('.mov');

  if (isVideo) {
    return (
      <div className={className} style={containerStyle} aria-hidden="true">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline={playsInline}
          className="w-full h-full object-cover"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'cover',
            filter: 'grayscale(100%) contrast(1.12)',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease-out',
          }}
          onError={handleVideoError}
          onCanPlay={handleVideoLoad}
          onLoadedData={handleVideoLoad}
          aria-hidden="true"
        />
        {poster && !isLoaded && (
          <img
            ref={imgRef}
            src={poster}
            alt=""
            className="w-full h-full object-cover"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              filter: 'grayscale(100%) contrast(1.12)',
              opacity: 0.5,
            }}
            aria-hidden="true"
          />
        )}
        {!isLoaded && (
          <div className="absolute inset-0 bg-[#050505] flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className} style={containerStyle} aria-hidden="true">
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          filter: 'grayscale(100%) contrast(1.12)',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-out',
        }}
        loading={priority ? 'eager' : 'lazy'}
        onError={handleImageError}
        onLoad={handleImageLoad}
        aria-hidden="true"
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#050505] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

export { CinemaMedia as default };