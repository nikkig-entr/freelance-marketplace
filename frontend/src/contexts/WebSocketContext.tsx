import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '../types';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinProject: (projectId: number) => void;
  leaveProject: (projectId: number) => void;
  sendMessage: (projectId: number, content: string, messageType?: string) => void;
  sendTyping: (projectId: number, isTyping: boolean) => void;
  onMessage: (callback: (message: Message) => void) => () => void;
  onTyping: (callback: (data: { userId: number; userName: string; isTyping: boolean }) => void) => () => void;
  onUserJoined: (callback: (data: { userId: number; userName: string }) => void) => () => void;
  onUserLeft: (callback: (data: { userId: number; userName: string }) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

const WS_URL = (import.meta as unknown as { env: Record<string, string | undefined> }).env.VITE_WS_URL || 'ws://localhost:8000';

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, tokens } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messageCallbacks = useRef<Set<(message: Message) => void>>(new Set());
  const typingCallbacks = useRef<Set<(data: { userId: number; userName: string; isTyping: boolean }) => void>>(new Set());
  const joinedCallbacks = useRef<Set<(data: { userId: number; userName: string }) => void>>(new Set());
  const leftCallbacks = useRef<Set<(data: { userId: number; userName: string }) => void>>(new Set());
  const currentProjectRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !tokens) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(WS_URL, {
      auth: {
        token: tokens.access_token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('WebSocket connected');

      // Rejoin current project if any
      if (currentProjectRef.current) {
        newSocket.emit('join_project', currentProjectRef.current);
      }
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('WebSocket disconnected:', reason);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    newSocket.on('new_message', (message: Message) => {
      messageCallbacks.current.forEach((callback) => callback(message));
    });

    newSocket.on('user_typing', (data: { user_id: number; user_name: string; is_typing: boolean }) => {
      typingCallbacks.current.forEach((callback) =>
        callback({ userId: data.user_id, userName: data.user_name, isTyping: data.is_typing })
      );
    });

    newSocket.on('user_joined', (data: { user_id: number; user_name: string }) => {
      joinedCallbacks.current.forEach((callback) =>
        callback({ userId: data.user_id, userName: data.user_name })
      );
    });

    newSocket.on('user_left', (data: { user_id: number; user_name: string }) => {
      leftCallbacks.current.forEach((callback) =>
        callback({ userId: data.user_id, userName: data.user_name })
      );
    });

    newSocket.on('error', (error: { message: string }) => {
      console.error('WebSocket error:', error.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, tokens, socket]);

  const joinProject = useCallback((projectId: number) => {
    if (socket?.connected) {
      socket.emit('join_project', projectId);
      currentProjectRef.current = projectId;
    }
  }, [socket]);

  const leaveProject = useCallback((projectId: number) => {
    if (socket?.connected) {
      socket.emit('leave_project', projectId);
      if (currentProjectRef.current === projectId) {
        currentProjectRef.current = null;
      }
    }
  }, [socket]);

  const sendMessage = useCallback(
    (projectId: number, content: string, messageType = 'user') => {
      if (socket?.connected) {
        socket.emit('send_message', { project_id: projectId, content, message_type: messageType });
      }
    },
    [socket]
  );

  const sendTyping = useCallback(
    (projectId: number, isTyping: boolean) => {
      if (socket?.connected) {
        socket.emit('typing', { project_id: projectId, is_typing: isTyping });
      }
    },
    [socket]
  );

  const onMessage = useCallback((callback: (message: Message) => void) => {
    messageCallbacks.current.add(callback);
    return () => messageCallbacks.current.delete(callback);
  }, []);

  const onTyping = useCallback(
    (callback: (data: { userId: number; userName: string; isTyping: boolean }) => void) => {
      typingCallbacks.current.add(callback);
      return () => typingCallbacks.current.delete(callback);
    },
    []
  );

  const onUserJoined = useCallback(
    (callback: (data: { userId: number; userName: string }) => void) => {
      joinedCallbacks.current.add(callback);
      return () => joinedCallbacks.current.delete(callback);
    },
    []
  );

  const onUserLeft = useCallback(
    (callback: (data: { userId: number; userName: string }) => void) => {
      leftCallbacks.current.add(callback);
      return () => leftCallbacks.current.delete(callback);
    },
    []
  );

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        joinProject,
        leaveProject,
        sendMessage,
        sendTyping,
        onMessage,
        onTyping,
        onUserJoined,
        onUserLeft,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}