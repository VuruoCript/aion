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

// Trading logic with competitive AI system
function executeTrades() {
  // Calculate current total portfolio value
  const totalBalance = appState.aiTraders.reduce((sum, t) => sum + t.balance, 0);

  // Find the current leader (exclude GROK and CLAUDE - they always lose)
  const competitors = appState.aiTraders.filter(t => t.name !== 'GROK' && t.name !== 'CLAUDE');
  const sortedCompetitors = [...competitors].sort((a, b) => b.balance - a.balance);
  const leader = sortedCompetitors[0];
  const secondPlace = sortedCompetitors[1];
  const thirdPlace = sortedCompetitors[2];

  // Portfolio pressure: HARD LIMIT at $1150 (never exceed)
  // Range: $230 to $1150
  let globalPressure = 0;
  if (totalBalance > 1100) {
    globalPressure = -0.40; // STRONG negative pressure near $1150
  } else if (totalBalance > 1000) {
    globalPressure = -0.25; // Moderate negative pressure
  } else if (totalBalance < 280) {
    globalPressure = 0.30; // Strong positive pressure near $230
  } else if (totalBalance < 350) {
    globalPressure = 0.15; // Moderate positive pressure
  }

  appState.aiTraders = appState.aiTraders.map(trader => {
    // Initialize previous balance if not exists
    if (!previousBalances[trader.name]) {
      previousBalances[trader.name] = trader.balance;
    }

    let bias = 0;
    let volatility = 3.0;

    // Competition logic: Leader gets pushed down, others get pushed up
    const isLeader = trader.name === leader?.name;
    const isSecond = trader.name === secondPlace?.name;
    const isThird = trader.name === thirdPlace?.name;

    switch(trader.name) {
      case 'GROK':
        // Always losing (around $18-$28)
        bias = trader.balance > 26 ? -0.70 : (trader.balance < 18 ? -0.20 : -0.45);
        volatility = 2.0;
        break;

      case 'CLAUDE':
        // Always losing (around $15-$24)
        bias = trader.balance > 22 ? -0.75 : (trader.balance < 15 ? -0.25 : -0.50);
        volatility = 2.0;
        break;

      case 'CHATGPT':
        // Competitive AI
        if (isLeader) {
          // Leader gets pushed down to create competition
          bias = -0.35;
        } else if (isSecond) {
          // Second place gets boost to challenge leader
          bias = 0.10;
        } else {
          // Third place gets strong boost to catch up
          bias = 0.20;
        }
        bias += globalPressure;
        volatility = 3.5;
        break;

      case 'DEEPSEEK':
        // Competitive AI
        if (isLeader) {
          bias = -0.30;
        } else if (isSecond) {
          bias = 0.15;
        } else {
          bias = 0.25;
        }
        bias += globalPressure;
        volatility = 3.5;
        break;

      case 'GEMINI':
        // Competitive AI
        if (isLeader) {
          bias = -0.32;
        } else if (isSecond) {
          bias = 0.12;
        } else {
          bias = 0.22;
        }
        bias += globalPressure;
        volatility = 3.5;
        break;

      default:
        bias = 0;
        volatility = 2.5;
    }

    // Calculate change with volatility
    const changePercent = (Math.random() * 2 - 1 + bias) * volatility;
    const change = trader.balance * (changePercent / 100);

    // Calculate new balance with minimum thresholds for $230-$1150 range
    let minBalance = 50;
    let maxBalance = 400; // Default

    if (trader.name === 'GROK') {
      minBalance = 15;
      maxBalance = 30;
    } else if (trader.name === 'CLAUDE') {
      minBalance = 12;
      maxBalance = 26;
    } else if (trader.name === 'CHATGPT') {
      minBalance = 140;
      maxBalance = 380;
    } else if (trader.name === 'DEEPSEEK') {
      minBalance = 130;
      maxBalance = 370;
    } else if (trader.name === 'GEMINI') {
      minBalance = 120;
      maxBalance = 360;
    }

    let newBalance = trader.balance + change;
    newBalance = Math.max(minBalance, Math.min(maxBalance, newBalance));

    // HARD CAP: If total would exceed $1150, reduce this trader's balance
    const projectedTotal = appState.aiTraders.reduce((sum, t) =>
      t.name === trader.name ? sum + newBalance : sum + t.balance, 0
    );

    if (projectedTotal > 1150) {
      const excess = projectedTotal - 1150;
      newBalance = Math.max(minBalance, newBalance - excess * 0.5);
    }

    // HARD FLOOR: If total would go below $230, boost this trader's balance
    if (projectedTotal < 230) {
      const deficit = 230 - projectedTotal;
      newBalance = Math.min(maxBalance, newBalance + deficit * 0.5);
    }

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
