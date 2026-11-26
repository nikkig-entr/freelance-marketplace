'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { clsx } from 'clsx';

interface ParallaxVideoProps {
  src: string;
  poster?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Parallax speed multiplier (0.1 - 1) */
  speed?: number;
  /** Zoom scale range */
  zoomRange?: [number, number];
  /** Whether to play video */
  autoPlay?: boolean;
  /** Whether to loop */
  loop?: boolean;
  /** Whether to mute */
  muted?: boolean;
  /** Plays inline for mobile */
  playsInline?: boolean;
  /** Container aspect ratio */
  aspectRatio?: number;
  /** Enable clip-path reveal on scroll */
  revealOnScroll?: boolean;
  /** Reveal threshold */
  revealThreshold?: number;
}

export function ParallaxVideo({
  src,
  poster,
  alt = '',
  className = '',
  style = {},
  speed = 0.3,
  zoomRange = [1, 1.15],
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  aspectRatio = 16 / 9,
  revealOnScroll = false,
  revealThreshold = 0.1,
}: ParallaxVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // y and scale are used via motion values in the video style
  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 30}%`]);
  const scale = useTransform(scrollYProgress, [0, 1], zoomRange);
  const clipPath = useTransform(scrollYProgress, [0, revealThreshold], ['inset(100% 0 0 0)', 'inset(0% 0 0 0)']);

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const handleCanPlay = () => setIsLoaded(true);
    const handleError = () => setHasError(true);

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    // Attempt to play
    if (autoPlay) {
      video.play().catch(() => {
        // Autoplay prevented, that's fine
      });
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [autoPlay]);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio,
    overflow: 'hidden',
    borderRadius: 'inherit',
    ...style,
  };

  const videoStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    minWidth: '100%',
    minHeight: '100%',
    objectFit: 'cover' as const,
    transformOrigin: 'center center',
    willChange: 'transform, clip-path',
  };

  const motionStyle = {
    ...videoStyle,
    ...(prefersReducedMotion ? {} : { y, scale }),
    ...(revealOnScroll && !prefersReducedMotion ? { clipPath } : {}),
  };

  return (
    <div
      ref={containerRef}
      className={clsx('relative overflow-hidden', className)}
      style={containerStyle}
      aria-hidden="true"
    >
      {!hasError && (
        <motion.video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          playsInline={playsInline}
          className="w-full h-full object-cover"
          style={motionStyle}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          aria-hidden="true"
        />
      )}

      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-obsidian/80 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 bg-graphite-900 flex items-center justify-center text-muted">
          <p className="font-mono text-sm">Unable to load video</p>
        </div>
      )}

      {poster && !isLoaded && !hasError && (
        <img
          src={poster}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

interface ParallaxImageProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  speed?: number;
  zoomRange?: [number, number];
  aspectRatio?: number;
  revealOnScroll?: boolean;
  revealThreshold?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
}

export function ParallaxImage({
  src,
  alt = '',
  className = '',
  style = {},
  speed = 0.25,
  zoomRange = [1, 1.12],
  aspectRatio = 16 / 9,
  revealOnScroll = false,
  revealThreshold = 0.1,
  loading = 'lazy',
  priority = false,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 25}%`]);
  const scale = useTransform(scrollYProgress, [0, 1], zoomRange);
  const clipPath = useTransform(scrollYProgress, [0, revealThreshold], ['inset(100% 0 0 0)', 'inset(0% 0 0 0)']);

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    aspectRatio,
    overflow: 'hidden',
    borderRadius: 'inherit',
    ...style,
  };

  const imageStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    minWidth: '100%',
    minHeight: '100%',
    objectFit: 'cover' as const,
    transformOrigin: 'center center',
    willChange: 'transform, clip-path',
  };

  const imageMotionStyle = {
    ...imageStyle,
    ...(prefersReducedMotion ? {} : { y, scale }),
    ...(revealOnScroll && !prefersReducedMotion ? { clipPath } : {}),
  };

  return (
    <div
      ref={containerRef}
      className={clsx('relative overflow-hidden', className)}
      style={containerStyle}
      aria-hidden="true"
    >
      {!hasError && (
        <motion.img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : loading}
          className="w-full h-full object-cover"
          style={imageMotionStyle}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          aria-hidden="true"
        />
      )}

      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-obsidian/80 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 bg-graphite-900 flex items-center justify-center text-muted">
          <p className="font-mono text-sm">Unable to load image</p>
        </div>
      )}
    </div>
  );
}