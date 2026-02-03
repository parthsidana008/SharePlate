import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { initializeSocket, disconnectSocket, getSocket } from '../services/socketService';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (user && token) {
      // Initialize socket connection
      const socket = initializeSocket(token);
      socketRef.current = socket;

      socket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected for user:', user.name);
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      // Listen for new request notifications
      socket.on('new_request', (data) => {
        setNotifications((prev) => [
          {
            id: Date.now(),
            type: 'new_request',
            message: data.message,
            data: data.request,
            timestamp: new Date()
          },
          ...prev
        ]);
      });

      // Listen for request status updates
      socket.on('request_status_update', (data) => {
        setNotifications((prev) => [
          {
            id: Date.now(),
            type: 'request_status_update',
            message: data.message,
            data: data.request,
            timestamp: new Date()
          },
          ...prev
        ]);
      });

      // Listen for chat messages
      socket.on('receive_message', (data) => {
        setNotifications((prev) => [
          {
            id: Date.now(),
            type: 'message',
            message: data.message,
            data: data,
            timestamp: new Date()
          },
          ...prev
        ]);
      });

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('new_request');
        socket.off('request_status_update');
        socket.off('receive_message');
      };
    } else {
      // Disconnect if user logs out
      disconnectSocket();
      setIsConnected(false);
      setNotifications([]);
    }
  }, [user, token]);

  const sendMessage = (recipientId, message, requestId, donationId) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('send_message', {
        recipientId,
        message,
        requestId,
        donationId
      });
    }
  };

  const sendTyping = (recipientId, isTyping) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('typing', {
        recipientId,
        isTyping
      });
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const value = {
    isConnected,
    notifications,
    sendMessage,
    sendTyping,
    clearNotifications,
    removeNotification
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

