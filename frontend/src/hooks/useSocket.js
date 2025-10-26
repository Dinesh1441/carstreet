import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

export const useSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Create socket connection
    socketRef.current = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // Connection events
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Socket connected:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Socket disconnected');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      setIsConnected(false);
    });

    socketRef.current.on('reconnect', (attempt) => {
      console.log('🔄 Socket reconnected after', attempt, 'attempts');
      setIsConnected(true);
    });

    setSocket(socketRef.current);

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log('🧹 Cleaning up socket connection');
        socketRef.current.close();
      }
    };
  }, [url]);

  return { socket, isConnected };
};