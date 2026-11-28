import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { NumericPreloader } from '@/components/ui/NumericPreloader';

export interface PreloaderContextValue {
  isPreloaderComplete: boolean;
  setPreloaderComplete: (complete: boolean) => void;
}

export const PreloaderContext = createContext<PreloaderContextValue | undefined>(undefined);

export function PreloaderProvider({ children }: { children: ReactNode }) {
  const [isPreloaderComplete, setIsPreloaderComplete] = useState(false);

  // Stable reference for setPreloaderComplete
  const stableSetPreloaderComplete = useCallback((complete: boolean) => {
    setIsPreloaderComplete(complete);
  }, []);

  // Handle preloader completion
  const handlePreloaderComplete = useCallback(() => {
    setIsPreloaderComplete(true);
  }, []);

  return (
    <PreloaderContext.Provider value={{ isPreloaderComplete, setPreloaderComplete: stableSetPreloaderComplete }}>
      {!isPreloaderComplete ? (
        <NumericPreloader onComplete={handlePreloaderComplete} />
      ) : (
        <div style={{ willChange: 'transform' }}>{children}</div>
      )}
    </PreloaderContext.Provider>
  );
}

export function usePreloader() {
  const context = useContext(PreloaderContext);
  if (!context) {
    throw new Error('usePreloader must be used within a PreloaderProvider');
  }
  return context;
}