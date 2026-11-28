import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { Toaster } from 'react-hot-toast'
import { router } from './router'
import { AuthProvider } from './contexts/AuthContext'
import { WebSocketProvider } from './contexts/WebSocketContext'
import { PreloaderProvider } from './contexts/PreloaderContext'
import { useLenis } from './hooks/useLenis'
import { IntroPreloader } from './components/ui/IntroPreloader'
import { CustomCursorProvider } from './components/ui/CustomCursor'
import './styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppRoot() {
  useLenis()

  return (
    <PreloaderProvider>
      <CustomCursorProvider enabled={true}>
        <IntroPreloader>
          <AuthProvider>
            <WebSocketProvider>
              <RouterProvider router={router} />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--color-bg-elevated)',
                    color: 'var(--color-text)',
                    boxShadow: 'var(--shadow-xl)',
                    borderRadius: '0',
                    padding: '1rem',
                    border: '1px solid var(--color-border)',
                  },
                  success: {
                    iconTheme: {
                      primary: 'var(--color-white)',
                      secondary: 'var(--color-bg)',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: 'var(--color-white)',
                      secondary: 'var(--color-bg)',
                    },
                  },
                }}
              />
            </WebSocketProvider>
          </AuthProvider>
        </IntroPreloader>
      </CustomCursorProvider>
    </PreloaderProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRoot />
    </QueryClientProvider>
  </React.StrictMode>
)