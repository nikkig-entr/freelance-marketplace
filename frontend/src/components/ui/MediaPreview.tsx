'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface MediaPreviewProps {
  /** The trigger element ref or selector */
  triggerRef?: React.RefObject<HTMLElement>;
  /** Media source - image or video */
  src: string;
  /** Media type */
  type: 'image' | 'video';
  /** Poster for video */
  poster?: string;
  /** Alt text */
  alt?: string;
  /** Position relative to trigger: 'fixed' (viewport) or 'absolute' (parent) */
  position?: 'fixed' | 'absolute';
  /** Offset from trigger */
  offset?: { x: number; y: number };
  /** Size of preview */
  size?: { width: number; height: number };
  /** Border radius */
  radius?: number;
  /** Z-index */
  zIndex?: number;
  /** Delay before showing */
  showDelay?: number;
  /** Delay before hiding */
  hideDelay?: number;
  /** Whether to follow mouse */
  followMouse?: boolean;
  /** Custom className */
  className?: string;
  /** Aspect ratio for sizing */
  aspectRatio?: number;
}

export function MediaPreview({
  triggerRef,
  src,
  type,
  poster,
  alt = '',
  position = 'fixed',
  offset = { x: 24, y: -24 },
  size = { width: 400, height: 225 },
  radius = 0,
  zIndex = 9990,
  showDelay = 80,
  hideDelay = 120,
  followMouse = false,
  className = '',
}: MediaPreviewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(0.95);
  const opacity = useMotionValue(0);
  const clipPath = useMotionValue('inset(100% 0 0 0)');

  const smoothX = useSpring(x, { stiffness: 300, damping: 35, mass: 0.6 });
  const smoothY = useSpring(y, { stiffness: 300, damping: 35, mass: 0.6 });
  const smoothScale = useSpring(scale, { stiffness: 400, damping: 35 });
  const smoothOpacity = useSpring(opacity, { stiffness: 300, damping: 35 });
  const smoothClipPath = useSpring(clipPath, { stiffness: 400, damping: 40 });

  const transform = useTransform(
    [smoothX, smoothY, smoothScale],
    ([x, y, s]) => `translate(${x}px, ${y}px) scale(${s})`
  );

  const show = useCallback((clientX?: number, clientY?: number) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }

    if (showTimeoutRef.current) return;

    showTimeoutRef.current = setTimeout(() => {
      if (clientX !== undefined && clientY !== undefined) {
        x.set(clientX + offset.x);
        y.set(clientY + offset.y);
      }
      setIsVisible(true);
      opacity.set(1);
      scale.set(1);
      clipPath.set('inset(0% 0 0 0)');
      showTimeoutRef.current = undefined;
    }, showDelay);
  }, [offset.x, offset.y, showDelay, x, y, opacity, scale, clipPath]);

  const hide = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = undefined;
    }

    if (hideTimeoutRef.current) return;

    opacity.set(0);
    scale.set(0.95);
    clipPath.set('inset(100% 0 0 0)');

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      hideTimeoutRef.current = undefined;
    }, hideDelay + 300);
  }, [hideDelay, opacity, scale, clipPath]);

  const setPosition = useCallback((clientX: number, clientY: number) => {
    if (followMouse && isVisible) {
      x.set(clientX + offset.x);
      y.set(clientY + offset.y);
    }
  }, [followMouse, isVisible, offset.x, offset.y, x, y]);

  useEffect(() => {
    if (triggerRef?.current) {
      const trigger = triggerRef.current;

      const handleMouseEnter = (e: MouseEvent) => show(e.clientX, e.clientY);
      const handleMouseMove = (e: MouseEvent) => setPosition(e.clientX, e.clientY);
      const handleMouseLeave = () => hide();

      trigger.addEventListener('mouseenter', handleMouseEnter);
      trigger.addEventListener('mousemove', handleMouseMove);
      trigger.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        trigger.removeEventListener('mouseenter', handleMouseEnter);
        trigger.removeEventListener('mousemove', handleMouseMove);
        trigger.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [triggerRef, show, hide, setPosition]);

  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  if (!isVisible || mediaError) return null;

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={containerRef}
        className={clsx(
          'pointer-events-none select-none overflow-hidden',
          className
        )}
        style={{
          position,
          zIndex,
          width: size.width,
          height: size.height,
          borderRadius: radius,
          transform: prefersReducedMotion ? undefined : transform,
          clipPath: prefersReducedMotion ? undefined : smoothClipPath,
          opacity: prefersReducedMotion ? (isVisible ? 1 : 0) : smoothOpacity,
          willChange: 'transform, clip-path, opacity',
          pointerEvents: 'none',
        }}
        initial={false}
        animate={isVisible ? {} : {}}
      >
        {type === 'video' ? (
          <video
            src={src}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover grayscale"
            onLoad={() => setIsLoaded(true)}
            onError={() => setMediaError(true)}
            aria-hidden="true"
            style={{ transform: 'scale(1.02)' }}
          />
        ) : (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover grayscale"
            onLoad={() => setIsLoaded(true)}
            onError={() => setMediaError(true)}
            aria-hidden="true"
            loading="lazy"
            style={{ transform: 'scale(1.02)' }}
          />
        )}
        {!isLoaded && (
          <div className="absolute inset-0 bg-[var(--color-bg)]/80 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-[var(--color-text)] rounded-full animate-spin" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/60 via-transparent to-transparent pointer-events-none" />
      </motion.div>
    </AnimatePresence>
  );
}

interface MediaPreviewListProps {
  /** Array of items with media */
  items: Array<{
    id: string | number;
    triggerRef: React.RefObject<HTMLElement>;
    media: { src: string; type: 'image' | 'video'; poster?: string; alt?: string };
  }>;
  /** Shared preview container */
  previewSize?: { width: number; height: number };
  /** Position of preview relative to list */
  previewPosition?: 'right' | 'left' | 'fixed';
  /** Gap between items */
  gap?: number;
  /** Active item index (controlled) */
  activeIndex?: number;
  /** Default active index */
  defaultActiveIndex?: number;
  /** On active change */
  onActiveChange?: (index: number) => void;
  /** Item renderer */
  renderItem: (item: MediaPreviewListProps['items'][0], isActive: boolean, setActive: () => void) => React.ReactNode;
}

export function MediaPreviewList({
  items,
  previewSize = { width: 480, height: 270 },
  previewPosition = 'fixed',
  gap = 0,
  activeIndex: controlledActiveIndex,
  defaultActiveIndex = 0,
  onActiveChange,
  renderItem,
}: MediaPreviewListProps) {
  const [activeIndex, setActiveIndex] = useState(controlledActiveIndex ?? defaultActiveIndex);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<MediaPreviewListProps['items'][0]['media'] | null>(null);
  const [previewPositionState, setPreviewPositionState] = useState({ x: 0, y: 0 });
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string | number, HTMLElement>>(new Map());

  const isControlled = controlledActiveIndex !== undefined;

  const handleItemEnter = useCallback((index: number, item: MediaPreviewListProps['items'][0], e: React.MouseEvent) => {
    setActiveIndex(index);
    setPreviewMedia(item.media);
    setPreviewPositionState({ x: e.clientX, y: e.clientY });
    setPreviewVisible(true);
    onActiveChange?.(index);
  }, [onActiveChange]);

  const handleItemMove = useCallback((e: React.MouseEvent) => {
    if (previewVisible) {
      setPreviewPositionState({ x: e.clientX, y: e.clientY });
    }
  }, [previewVisible]);

  const handleItemLeave = useCallback(() => {
    if (!isControlled) {
      setPreviewVisible(false);
      setPreviewMedia(null);
    }
  }, [isControlled]);

  const handleListLeave = useCallback(() => {
    if (!isControlled) {
      setPreviewVisible(false);
      setPreviewMedia(null);
    }
  }, [isControlled]);

  return (
    <div className="relative" ref={listRef} onMouseLeave={handleListLeave}>
      <div className="relative z-10" style={{ display: 'flex', flexDirection: 'column', gap }}>
        {items.map((item, index) => {
          const ItemComponent = renderItem(item, index === activeIndex, () => setActiveIndex(index));
          return (
            <div
              key={item.id}
              ref={(el) => { if (el) itemRefs.current.set(item.id, el); }}
              onMouseEnter={(e) => handleItemEnter(index, item, e)}
              onMouseMove={handleItemMove}
              onMouseLeave={handleItemLeave}
              className="relative"
            >
              {ItemComponent}
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {previewVisible && previewMedia && (
          <motion.div
            className="pointer-events-none select-none overflow-hidden"
            style={{
              position: previewPosition === 'fixed' ? 'fixed' : 'absolute',
              zIndex: 9995,
              width: previewSize.width,
              height: previewSize.height,
              borderRadius: 0,
              left: previewPositionState.x + 24,
              top: previewPositionState.y - previewSize.height - 24,
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20, clipPath: 'inset(100% 0 0 0)' }}
            animate={{ opacity: 1, scale: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
            exit={{ opacity: 0, scale: 0.95, y: -20, clipPath: 'inset(100% 0 0 0)' }}
            transition={{
              opacity: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
              scale: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
              y: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
              clipPath: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
            }}
          >
            {previewMedia.type === 'video' ? (
              <video
                src={previewMedia.src}
                poster={previewMedia.poster}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover grayscale"
                aria-hidden="true"
              />
            ) : (
              <img
                src={previewMedia.src}
                alt={previewMedia.alt || ''}
                className="w-full h-full object-cover grayscale"
                aria-hidden="true"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/60 via-transparent to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}