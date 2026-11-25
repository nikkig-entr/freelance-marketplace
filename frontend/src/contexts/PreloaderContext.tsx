import { createContext, useContext, useState, ReactNode } from 'react';

export interface PreloaderContextValue {
  isPreloaderComplete: boolean;
  setPreloaderComplete: (complete: boolean) => void;
}

export const PreloaderContext = createContext<PreloaderContextValue | undefined>(undefined);

export function PreloaderProvider({ children }: { children: ReactNode }) {
  const [isPreloaderComplete, setPreloaderComplete] = useState(false);

  return (
    <PreloaderContext.Provider value={{ isPreloaderComplete, setPreloaderComplete }}>
      {children}
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