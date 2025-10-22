import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { hyperliquidConfig } from '../config/hyperliquid.config.js';
import logger from '../utils/logger.js';
import { MarketData, OrderBook } from '../utils/marketData.js';

export interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  price?: number;
  size: number;
  leverage: number;
  status: 'open' | 'filled' | 'cancelled';
  timestamp: number;
}

export interface Position {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  leverage: number;
  unrealizedPnL: number;
  liquidationPrice: number;
}

export interface AccountBalance {
  totalBalance: number;
  availableBalance: number;
  marginUsed: number;
  unrealizedPnL: number;
}

export class HyperliquidService {
  private client: AxiosInstance;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.apiKey = hyperliquidConfig.apiKey;
    this.apiSecret = hyperliquidConfig.apiSecret;

    this.client = axios.create({
      baseURL: hyperliquidConfig.apiUrl,
      timeout: hyperliquidConfig.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    logger.info('HyperliquidService initialized');
  }

  private generateSignature(timestamp: number, method: string, path: string, body: string): string {
    const message = `${timestamp}${method}${path}${body}`;
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(message)
      .digest('hex');
  }

  async getMarketData(symbol: string): Promise<MarketData> {
    try {
      // Placeholder: Replace with actual Hyperliquid API call
      logger.debug(`Fetching market data for ${symbol}`);

      // Simulated data for development
      return {
        symbol,
        price: Math.random() * 50000 + 20000,
        volume24h: Math.random() * 1000000000,
        priceChange24h: (Math.random() - 0.5) * 10,
        high24h: Math.random() * 55000 + 20000,
        low24h: Math.random() * 45000 + 15000,
        timestamp: Date.now()
      };
    } catch (error: any) {
      logger.error(`Error fetching market data for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getOrderbook(symbol: string, depth: number = 10): Promise<OrderBook> {
    try {
      logger.debug(`Fetching orderbook for ${symbol}`);

      // Simulated orderbook
      const basePrice = Math.random() * 50000 + 20000;
      const bids: [number, number][] = [];
      const asks: [number, number][] = [];

      for (let i = 0; i < depth; i++) {
        bids.push([basePrice - i * 10, Math.random() * 10]);
        asks.push([basePrice + i * 10, Math.random() * 10]);
      }

      return {
        bids,
        asks,
        timestamp: Date.now()
      };
    } catch (error: any) {
      logger.error(`Error fetching orderbook for ${symbol}:`, error.message);
      throw error;
    }
  }

  async placeOrder(params: {
    symbol: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    size: number;
    leverage: number;
    price?: number;
    reduceOnly?: boolean;
  }): Promise<Order> {
    try {
      logger.info(`Placing order: ${params.side} ${params.size} ${params.symbol} @ ${params.leverage}x`);

      // Simulated order for development
      const order: Order = {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol: params.symbol,
        side: params.side,
        type: params.type,
        price: params.price,
        size: params.size,
        leverage: params.leverage,
        status: 'filled',
        timestamp: Date.now()
      };

      logger.info(`Order placed successfully: ${order.id}`);
      return order;
    } catch (error: any) {
      logger.error('Error placing order:', error.message);
      throw error;
    }
  }

  async getPositions(): Promise<Position[]> {
    try {
      logger.debug('Fetching open positions');

      // Simulated positions
      return [];
    } catch (error: any) {
      logger.error('Error fetching positions:', error.message);
      throw error;
    }
  }

  async closePosition(symbol: string): Promise<boolean> {
    try {
      logger.info(`Closing position for ${symbol}`);

      // Simulated close
      return true;
    } catch (error: any) {
      logger.error(`Error closing position for ${symbol}:`, error.message);
      throw error;
    }
  }

  async setStopLoss(symbol: string, price: number): Promise<boolean> {
    try {
      logger.info(`Setting stop loss for ${symbol} at ${price}`);

      // Simulated
      return true;
    } catch (error: any) {
      logger.error(`Error setting stop loss for ${symbol}:`, error.message);
      throw error;
    }
  }

  async setTakeProfit(symbol: string, price: number): Promise<boolean> {
    try {
      logger.info(`Setting take profit for ${symbol} at ${price}`);

      // Simulated
      return true;
    } catch (error: any) {
      logger.error(`Error setting take profit for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getAccountBalance(): Promise<AccountBalance> {
    try {
      logger.debug('Fetching account balance');

      // Simulated balance
      return {
        totalBalance: 1000,
        availableBalance: 900,
        marginUsed: 100,
        unrealizedPnL: 0
      };
    } catch (error: any) {
      logger.error('Error fetching account balance:', error.message);
      throw error;
    }
  }

  async getTradeHistory(limit: number = 50): Promise<any[]> {
    try {
      logger.debug(`Fetching trade history (limit: ${limit})`);

      // Simulated history
      return [];
    } catch (error: any) {
      logger.error('Error fetching trade history:', error.message);
      throw error;
    }
  }
}
