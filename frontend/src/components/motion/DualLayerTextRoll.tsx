'use client';

import { motion } from 'framer-motion';

interface DualLayerTextRollProps {
  children: React.ReactNode;
  index: string;
  className?: string;
}

/**
 * Dual-Layer Text Roll - Hover-activated vertical text translation
 *
 * Two stacked copies of text translate vertically on hover:
 * - Layer 1 (default): y: '0%' -> '-100%' (slides up and out)
 * - Layer 2 (hover): y: '100%' -> '0%' (slides up from bottom)
 * - Duration: 0.36s, Ease: [0.16, 1, 0.3, 1]
 * - overflow-hidden relative inline-flex flex-col leading-none
 */
export function DualLayerTextRoll({
  children,
  index,
  className = '',
}: DualLayerTextRollProps) {
  return (
    <motion.div
      className={`relative overflow-hidden inline-flex flex-col leading-none ${className}`}
      style={{ perspective: '400px' }}
      whileHover={{
        // Triggered by Framer Motion's whileHover
      }}
    >
      {/* Layer 1 - Default text (slides up and out on hover) */}
      <motion.div
        className="flex items-center gap-3"
        initial={false}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{ y: '-100%', opacity: 0 }}
        transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="font-mono text-[var(--color-text-subtle)] text-xs tracking-wider">
          {index}
        </span>
        <span className="font-mono font-medium text-[var(--color-text-muted)] uppercase tracking-[0.22em]">
          {children}
        </span>
      </motion.div>

      {/* Layer 2 - Hover text (slides up from bottom on hover) */}
      <motion.div
        className="absolute left-0 top-full flex items-center gap-3 whitespace-nowrap"
        initial={false}
        animate={{ y: 0, opacity: 0 }}
        whileHover={{ y: '-100%', opacity: 1 }}
        transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="font-mono text-[var(--color-text-subtle)] text-xs tracking-wider">
          {index}
        </span>
        <span className="font-mono font-medium text-[var(--color-text)] uppercase tracking-[0.22em]">
          {children}
        </span>
      </motion.div>
    </motion.div>
  );
}

export { DualLayerTextRoll as default };