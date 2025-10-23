import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { DataPersistence, type AITrader, type AppData } from './services/DataPersistence.js';
import logger from './utils/logger.js';
import { generateAdvancedMessage } from './utils/messageGenerator.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;

// Create Express app
const app = express();
const httpServer = createServer(app);

// Configure Socket.IO with CORS
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Data Persistence
const dataPersistence = new DataPersistence();

// Type definitions
type TraderStatus = 'analyzing' | 'trading' | 'waiting';

// Initial AI Traders configuration
const initialAITraders: AITrader[] = [
  { name: 'GROK', balance: 200, status: 'analyzing', strategy: 'Momentum Trading', winRate: 0, trades: 0, totalPnL: 0, color: '#a0a0a0' },
  { name: 'CLAUDE', balance: 200, status: 'analyzing', strategy: 'Mean Reversion', winRate: 0, trades: 0, totalPnL: 0, color: '#f47855' },
  { name: 'CHATGPT', balance: 200, status: 'analyzing', strategy: 'Trend Following', winRate: 0, trades: 0, totalPnL: 0, color: '#009a57' },
  { name: 'DEEPSEEK', balance: 200, status: 'analyzing', strategy: 'Statistical Arbitrage', winRate: 0, trades: 0, totalPnL: 0, color: '#396bff' },
  { name: 'GEMINI', balance: 200, status: 'analyzing', strategy: 'Breakout Trading', winRate: 0, trades: 0, totalPnL: 0, color: '#9068c1' }
];

// In-memory state
let appState: AppData = {
  aiTraders: initialAITraders,
  chartData: [],
  messages: [],
  timeElapsed: 0
};

// Trading intervals
let tradingInterval: NodeJS.Timeout | null = null;
let chartInterval: NodeJS.Timeout | null = null;
let runtimeInterval: NodeJS.Timeout | null = null;

// Keep track of previous balances for message generation
const previousBalances: { [key: string]: number } = {};

// Trading logic
function executeTrades() {
  appState.aiTraders = appState.aiTraders.map(trader => {
    // Initialize previous balance if not exists
    if (!previousBalances[trader.name]) {
      previousBalances[trader.name] = trader.balance;
    }

    // Different risk profiles for each AI to make it more realistic
    let bias = 0;
    let volatility = 3;

    switch(trader.name) {
      case 'GROK':
        bias = -0.52; // Slight losses - will decline slowly
        volatility = 2.5;
        break;
      case 'CLAUDE':
        bias = -0.54; // Moderate losses - needs to come down from high balance
        volatility = 2.7;
        break;
      case 'CHATGPT':
        bias = -0.48; // Small gains - will grow slightly
        volatility = 2.4;
        break;
      case 'DEEPSEEK':
        bias = -0.53; // Moderate losses - needs to come down from high balance
        volatility = 2.6;
        break;
      case 'GEMINI':
        bias = -0.50; // Neutral - balanced performance
        volatility = 2.3;
        break;
      default:
        bias = -0.51;
        volatility = 2.5;
    }

    const changePercent = (Math.random() + bias) * volatility;
    const change = trader.balance * (changePercent / 100);
    const newBalance = Math.max(50, trader.balance + change);
    const tradeWon = change > 0;

    // Generate advanced message with 1000+ variations (70% chance)
    if (Math.random() > 0.3) {
      const message = generateAdvancedMessage(
        trader.name,
        newBalance,
        previousBalances[trader.name]
      );

      appState.messages = [
        {
          trader: trader.name,
          message,
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
        },
        ...appState.messages.slice(0, 99)
      ];
    }

    // Update previous balance for next iteration
    previousBalances[trader.name] = newBalance;

    const newTotalTrades = trader.trades + 1;
    const newWinningTrades = tradeWon ? (trader.winRate * trader.trades / 100) + 1 : (trader.winRate * trader.trades / 100);
    const newWinRate = newTotalTrades > 0 ? (newWinningTrades / newTotalTrades) * 100 : 0;

    const randomStatus = Math.random();
    const newStatus: TraderStatus = randomStatus > 0.7 ? 'trading' : (randomStatus > 0.5 ? 'analyzing' : 'waiting');

    return {
      ...trader,
      balance: newBalance,
      totalPnL: newBalance - 200,
      status: newStatus,
      trades: newTotalTrades,
      winRate: newWinRate
    };
  });

  // Broadcast update to all clients
  io.emit('traders:update', appState.aiTraders);
  io.emit('messages:update', appState.messages);

  // Save to disk less frequently (every 6th trade = every 30 seconds)
  if (appState.messages.length % 6 === 0) {
    dataPersistence.save(appState);
  }
}

function updateChart() {
  const newPoint: any = { time: new Date().toLocaleTimeString('en-US', { hour12: false }) };
  appState.aiTraders.forEach(trader => {
    newPoint[trader.name] = trader.balance;
  });
  appState.chartData = [...appState.chartData, newPoint];

  // Limit chart data to last 500 points to avoid memory bloat
  if (appState.chartData.length > 500) {
    appState.chartData = appState.chartData.slice(-500);
  }

  // Broadcast chart update
  io.emit('chart:update', appState.chartData);

  // Save to disk less frequently (every 30 seconds instead of 5)
  if (appState.chartData.length % 6 === 0) {
    dataPersistence.save(appState);
  }
}

function updateRuntime() {
  appState.timeElapsed += 1;

  // Broadcast runtime update
  io.emit('runtime:update', appState.timeElapsed);

  // Save to disk (less frequently for runtime)
  if (appState.timeElapsed % 10 === 0) {
    dataPersistence.save(appState);
  }
}

function startTradingEngine() {
  if (tradingInterval || chartInterval || runtimeInterval) {
    logger.warn('Trading engine already running');
    return;
  }

  logger.info('Starting trading engine...');

  // Runtime counter - every second
  runtimeInterval = setInterval(updateRuntime, 1000);

  // Trading logic - every 5 seconds
  tradingInterval = setInterval(executeTrades, 5000);

  // Chart update - every 5 seconds
  chartInterval = setInterval(updateChart, 5000);

  logger.info('Trading engine started');
}

function stopTradingEngine() {
  if (tradingInterval) clearInterval(tradingInterval);
  if (chartInterval) clearInterval(chartInterval);
  if (runtimeInterval) clearInterval(runtimeInterval);

  tradingInterval = null;
  chartInterval = null;
  runtimeInterval = null;

  logger.info('Trading engine stopped');
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  // Send current state to newly connected client
  socket.emit('initial:state', appState);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connections: io.engine.clientsCount,
    engineRunning: !!tradingInterval
  });
});

app.get('/api/state', (req, res) => {
  res.json(appState);
});

app.post('/api/start', (req, res) => {
  startTradingEngine();
  res.json({ message: 'Trading engine started', state: appState });
});

app.post('/api/stop', (req, res) => {
  stopTradingEngine();
  res.json({ message: 'Trading engine stopped' });
});

app.post('/api/reset', async (req, res) => {
  stopTradingEngine();

  appState = {
    aiTraders: initialAITraders,
    chartData: [],
    messages: [],
    timeElapsed: 0
  };

  await dataPersistence.save(appState);

  // Broadcast reset to all clients
  io.emit('initial:state', appState);

  // Restart trading engine
  startTradingEngine();

  res.json({ message: 'State reset', state: appState });
});

// Initialize and start server
async function initialize() {
  await dataPersistence.initialize();

  // Try to load previous state
  const savedData = await dataPersistence.load();
  if (savedData) {
    appState = savedData;
    logger.info('Loaded previous state from disk');
  }

  // Start HTTP server
  httpServer.listen(PORT, () => {
    logger.info(`╔═══════════════════════════════════════════════════╗`);
    logger.info(`║  AION TRADING SYSTEM - BACKEND SERVER            ║`);
    logger.info(`╠═══════════════════════════════════════════════════╣`);
    logger.info(`║  HTTP/Socket.IO:    http://localhost:${PORT}       ║`);
    logger.info(`║  Environment:       ${process.env.NODE_ENV || 'development'}        ║`);
    logger.info(`╚═══════════════════════════════════════════════════╝`);

    // Auto-start trading engine
    startTradingEngine();
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  stopTradingEngine();
  await dataPersistence.forceSave();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  stopTradingEngine();
  await dataPersistence.forceSave();
  process.exit(0);
});

// Start the server
initialize().catch(error => {
  logger.error('Failed to initialize server:', error);
  process.exit(1);
});
