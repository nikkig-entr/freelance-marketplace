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
  const [hasError, setHasError] = useState(false);
  const timeRef = useRef(0);

  const drawWireframeFallback = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Deep charcoal background
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    // Architectural wireframe grid
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;

    const gridSize = 50;
    const gridOffsetX = 0;
    const gridOffsetY = 0;

    // Vertical grid lines with subtle perspective
    for (let x = -gridOffsetX; x < width + gridSize; x += gridSize) {
      const perspective = 1 - Math.abs(x - width * 0.5) / (width * 0.9);
      ctx.globalAlpha = 0.03 * Math.max(0.15, perspective);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + (width * 0.5 - x) * 0.15, height);
      ctx.stroke();
    }

    // Horizontal grid lines with subtle perspective
    for (let y = -gridOffsetY; y < height + gridSize; y += gridSize) {
      const perspective = 1 - Math.abs(y - height * 0.5) / (height * 0.9);
      ctx.globalAlpha = 0.025 * Math.max(0.15, perspective);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y + (height * 0.5 - y) * 0.1);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Subtle corner brackets (architectural reference marks)
    const bracketSize = Math.min(width, height) * 0.08;
    const bracketWeight = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = bracketWeight;
    ctx.lineCap = 'square';

    // Top-left
    ctx.beginPath();
    ctx.moveTo(20, 20 + bracketSize);
    ctx.lineTo(20, 20);
    ctx.lineTo(20 + bracketSize, 20);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(width - 20 - bracketSize, 20);
    ctx.lineTo(width - 20, 20);
    ctx.lineTo(width - 20, 20 + bracketSize);
    ctx.stroke();

    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(20, height - 20 - bracketSize);
    ctx.lineTo(20, height - 20);
    ctx.lineTo(20 + bracketSize, height - 20);
    ctx.stroke();

    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(width - 20 - bracketSize, height - 20);
    ctx.lineTo(width - 20, height - 20);
    ctx.lineTo(width - 20, height - 20 - bracketSize);
    ctx.stroke();

    // Center crosshair (very subtle)
    ctx.strokeStyle = 'rgba(255,255,255,0.02)';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([10, 20]);
    ctx.beginPath();
    ctx.moveTo(width * 0.5, 0);
    ctx.lineTo(width * 0.5, height);
    ctx.moveTo(0, height * 0.5);
    ctx.lineTo(width, height * 0.5);
    ctx.stroke();
    ctx.setLineDash([]);

    // Subtle vignette
    const vignette = ctx.createRadialGradient(
      width * 0.5, height * 0.5, 0,
      width * 0.5, height * 0.5, Math.max(width, height) * 0.7
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }, []);

  const animateCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !useCanvas) return;

    timeRef.current += 16.67;
    drawWireframeFallback(canvas);
    animationRef.current = requestAnimationFrame(animateCanvas);
  }, [drawWireframeFallback, useCanvas]);

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
    setHasError(true);
  }, []);

  const handleImageError = useCallback(() => {
    setUseCanvas(true);
    setIsLoaded(true);
    setHasError(true);
  }, []);

  const handleVideoLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
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
      <div className={className} style={containerStyle} aria-hidden="true" data-cinema-fallback="wireframe">
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
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            <div className="text-center opacity-30">
              <div className="font-mono text-xs tracking-widest uppercase text-white/40 mb-2">
                Architectural Wireframe Fallback
              </div>
              <div className="w-24 h-px bg-white/10 mx-auto" />
            </div>
          </div>
        )}
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