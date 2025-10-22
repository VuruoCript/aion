import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketService } from './services/WebSocketService.js';
import { TradingEngine } from './services/TradingEngine.js';
import logger from './utils/logger.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3001;
const WS_PORT = Number(process.env.WS_PORT) || 3002;

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize WebSocket service
const wsService = new WebSocketService(WS_PORT);

// Initialize Trading Engine
const tradingEngine = new TradingEngine(wsService);

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    wsConnections: wsService.getClientCount()
  });
});

app.get('/api/traders', (req, res) => {
  try {
    const traders = tradingEngine.getTraders().map(t => t.toJSON());
    res.json({ traders });
  } catch (error: any) {
    logger.error('Error fetching traders:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/start', async (req, res) => {
  try {
    tradingEngine.start();
    res.json({ message: 'Trading engine started' });
  } catch (error: any) {
    logger.error('Error starting engine:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/stop', (req, res) => {
  try {
    tradingEngine.stop();
    res.json({ message: 'Trading engine stopped' });
  } catch (error: any) {
    logger.error('Error stopping engine:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Express error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start HTTP server
app.listen(PORT, () => {
  logger.info(`╔═══════════════════════════════════════════════════╗`);
  logger.info(`║  AI TRADING SYSTEM - BACKEND SERVER              ║`);
  logger.info(`╠═══════════════════════════════════════════════════╣`);
  logger.info(`║  HTTP Server:       http://localhost:${PORT}       ║`);
  logger.info(`║  WebSocket Server:  ws://localhost:${WS_PORT}       ║`);
  logger.info(`║  Environment:       ${process.env.NODE_ENV || 'development'}        ║`);
  logger.info(`╚═══════════════════════════════════════════════════╝`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  tradingEngine.stop();
  wsService.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down gracefully...');
  tradingEngine.stop();
  wsService.close();
  process.exit(0);
});

// Auto-start trading engine in production
if (process.env.NODE_ENV === 'production') {
  logger.info('Auto-starting trading engine...');
  tradingEngine.start().catch(error => {
    logger.error('Error auto-starting trading engine:', error);
  });
}
