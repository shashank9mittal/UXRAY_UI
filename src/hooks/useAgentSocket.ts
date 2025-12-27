import { useEffect } from 'react';

/**
 * Custom hook for establishing WebSocket connection to the agent server
 * @param userId - The unique identifier for the user
 */
export function useAgentSocket(userId: string) {
  useEffect(() => {
    if (!userId) {
      console.warn('useAgentSocket: userId is required');
      return;
    }

    // Establish WebSocket connection
    const ws = new WebSocket(`ws://localhost:3000/?userId=${userId}`);

    // Event listener for when connection is opened
    ws.onopen = () => {
      console.log('WS Connected');
    };

    // Event listener for incoming messages
    ws.onmessage = (event) => {
      console.log('Message received:', event.data);
    };

    // Event listener for when connection is closed
    ws.onclose = () => {
      console.log('WS Connection closed');
    };

    // Event listener for errors
    ws.onerror = (error) => {
      console.error('WS Error:', error);
    };

    // Cleanup function to close the socket when component unmounts or userId changes
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  }, [userId]);
}
