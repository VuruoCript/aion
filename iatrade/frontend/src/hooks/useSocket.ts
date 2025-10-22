import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface AITrader {
  name: string;
  balance: number;
  status: 'analyzing' | 'trading' | 'waiting';
  strategy: string;
  winRate: number;
  trades: number;
  totalPnL: number;
  color: string;
}

interface ChartDataPoint {
  time: string;
  [key: string]: number | string;
}

interface TradeMessage {
  trader: string;
  message: string;
  timestamp: string;
}

interface AppState {
  aiTraders: AITrader[];
  chartData: ChartDataPoint[];
  messages: TradeMessage[];
  timeElapsed: number;
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [serverlessMode, setServerlessMode] = useState(false);
  const [appState, setAppState] = useState<AppState>({
    aiTraders: [],
    chartData: [],
    messages: [],
    timeElapsed: 0
  });

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Try to detect if backend is serverless (Vercel)
    const isVercel = apiUrl.includes('vercel.app');

    if (isVercel) {
      // Use REST polling for Vercel serverless
      console.log('🔄 Serverless mode detected - using REST API polling');
      setServerlessMode(true);
      setConnected(true);

      // Initial fetch
      fetchState();

      // Poll every 3 seconds
      const pollInterval = setInterval(fetchState, 3000);

      async function fetchState() {
        try {
          const response = await fetch(`${apiUrl}/api/state`);
          if (response.ok) {
            const data = await response.json();
            setAppState(data);
          }
        } catch (error) {
          console.error('Error fetching state:', error);
          setConnected(false);
        }
      }

      return () => {
        clearInterval(pollInterval);
      };
    } else {
      // Use WebSocket for full-featured backend (Railway/Render/Local)
      console.log('🔌 Connecting to WebSocket backend');
      const newSocket = io(apiUrl, {
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.warn('⚠️ Socket connection error, falling back to polling:', error.message);
        // Could implement polling fallback here if needed
      });

      // Listen for initial state
      newSocket.on('initial:state', (data: AppState) => {
        console.log('📦 Received initial state');
        setAppState(data);
      });

      // Listen for traders update
      newSocket.on('traders:update', (traders: AITrader[]) => {
        setAppState(prev => ({ ...prev, aiTraders: traders }));
      });

      // Listen for chart update
      newSocket.on('chart:update', (chartData: ChartDataPoint[]) => {
        setAppState(prev => ({ ...prev, chartData }));
      });

      // Listen for messages update
      newSocket.on('messages:update', (messages: TradeMessage[]) => {
        setAppState(prev => ({ ...prev, messages }));
      });

      // Listen for runtime update
      newSocket.on('runtime:update', (timeElapsed: number) => {
        setAppState(prev => ({ ...prev, timeElapsed }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, []);

  return {
    socket,
    connected,
    serverlessMode,
    ...appState
  };
}
