import { WebSocketServer, WebSocket } from 'ws';
import logger from '../utils/logger.js';

export type WSMessage =
  | { type: 'TRADER_UPDATE'; trader: any; timestamp: number }
  | { type: 'TRADE_MESSAGE'; trader: string; message: string; action?: string; symbol?: string; timestamp: number }
  | { type: 'CHART_UPDATE'; data: any[]; timestamp: number }
  | { type: 'ERROR'; error: string; trader?: string }
  | { type: 'SYSTEM'; message: string };

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Set<WebSocket>;

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.clients = new Set();

    this.wss.on('connection', (ws: WebSocket) => {
      logger.info('New WebSocket client connected');
      this.clients.add(ws);

      ws.on('close', () => {
        logger.info('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send welcome message
      this.send(ws, {
        type: 'SYSTEM',
        message: 'Connected to AI Trading System'
      });
    });

    logger.info(`WebSocket server running on port ${port}`);
  }

  broadcast(message: WSMessage): void {
    const data = JSON.stringify(message);
    let successCount = 0;
    let errorCount = 0;

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(data);
          successCount++;
        } catch (error) {
          errorCount++;
          logger.error('Error broadcasting to client:', error);
        }
      }
    });

    if (successCount > 0 || errorCount > 0) {
      logger.debug(`Broadcast: ${successCount} success, ${errorCount} errors`);
    }
  }

  send(client: WebSocket, message: WSMessage): void {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(message));
      } catch (error) {
        logger.error('Error sending to client:', error);
      }
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }

  close(): void {
    this.clients.forEach((client) => {
      client.close();
    });
    this.wss.close();
    logger.info('WebSocket server closed');
  }
}
