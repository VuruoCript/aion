import { LLMProvider } from '../config/llm.config.js';

export interface Position {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  currentPrice: number;
  size: number;
  leverage: number;
  stopLoss: number;
  takeProfit?: number;
  unrealizedPnL: number;
  openedAt: Date;
}

export interface Trade {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: number;
  exitPrice: number;
  size: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  reasoning: string;
  strategy: string;
  confidence: number;
  openedAt: Date;
  closedAt: Date;
}

export interface TradingDecision {
  action: 'OPEN_LONG' | 'OPEN_SHORT' | 'CLOSE_POSITION' | 'HOLD';
  symbol: string;
  size?: number;
  leverage?: number;
  stopLoss?: number;
  takeProfit?: number;
  reasoning: string;
  strategy: string;
  confidence: number;
}

export class AITrader {
  public id: string;
  public name: string;
  public llmProvider: LLMProvider;
  public initialBalance: number;
  public currentBalance: number;
  public totalPnL: number;
  public winRate: number;
  public totalTrades: number;
  public winningTrades: number;
  public openPositions: Position[];
  public tradeHistory: Trade[];
  public status: 'analyzing' | 'trading' | 'waiting' | 'error';
  public lastAction: string;
  public strategy: string;
  public color: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    name: string,
    llmProvider: LLMProvider,
    initialBalance: number,
    strategy: string,
    color: string
  ) {
    this.id = `trader_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.name = name;
    this.llmProvider = llmProvider;
    this.initialBalance = initialBalance;
    this.currentBalance = initialBalance;
    this.totalPnL = 0;
    this.winRate = 0;
    this.totalTrades = 0;
    this.winningTrades = 0;
    this.openPositions = [];
    this.tradeHistory = [];
    this.status = 'waiting';
    this.lastAction = 'Initialized';
    this.strategy = strategy;
    this.color = color;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateBalance(trade: Trade): void {
    this.currentBalance += trade.pnl;
    this.totalPnL = this.currentBalance - this.initialBalance;
    this.updatedAt = new Date();
  }

  addTrade(trade: Trade): void {
    this.tradeHistory.push(trade);
    this.totalTrades++;

    if (trade.pnl > 0) {
      this.winningTrades++;
    }

    this.winRate = this.totalTrades > 0
      ? (this.winningTrades / this.totalTrades) * 100
      : 0;

    this.updatedAt = new Date();
  }

  addPosition(position: Position): void {
    this.openPositions.push(position);
    this.updatedAt = new Date();
  }

  removePosition(positionId: string): Position | undefined {
    const index = this.openPositions.findIndex(p => p.id === positionId);
    if (index !== -1) {
      const position = this.openPositions.splice(index, 1)[0];
      this.updatedAt = new Date();
      return position;
    }
    return undefined;
  }

  canOpenPosition(): boolean {
    return this.openPositions.length < 3; // Max 3 positions
  }

  isInRecoveryMode(): boolean {
    return this.currentBalance < 50; // Recovery mode if balance below $50
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      balance: this.currentBalance,
      totalPnL: this.totalPnL,
      winRate: this.winRate,
      totalTrades: this.totalTrades,
      winningTrades: this.winningTrades,
      openPositions: this.openPositions.length,
      status: this.status,
      lastAction: this.lastAction,
      strategy: this.strategy,
      color: this.color,
      positions: this.openPositions,
      recentTrades: this.tradeHistory.slice(-10)
    };
  }
}
