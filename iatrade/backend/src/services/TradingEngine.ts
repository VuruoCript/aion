import { AITrader, TradingDecision, Trade, Position } from '../models/AITrader.js';
import { LLMService } from './LLMService.js';
import { HyperliquidService } from './HyperliquidService.js';
import { WebSocketService } from './WebSocketService.js';
import { tradingConfig } from '../config/hyperliquid.config.js';
import { generateMarketData, TradingContext } from '../utils/marketData.js';
import logger from '../utils/logger.js';

export class TradingEngine {
  private aiTraders: AITrader[];
  private llmService: LLMService;
  private hyperliquidService: HyperliquidService;
  private wsService: WebSocketService;
  private isRunning: boolean;
  private tradingSymbols: string[];

  constructor(wsService: WebSocketService) {
    this.aiTraders = [];
    this.llmService = new LLMService();
    this.hyperliquidService = new HyperliquidService();
    this.wsService = wsService;
    this.isRunning = false;
    this.tradingSymbols = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'ARB-USD', 'AVAX-USD'];

    this.initializeTraders();
  }

  private initializeTraders(): void {
    const initialBalance = tradingConfig.initialBalancePerAI;

    this.aiTraders = [
      new AITrader('GROK', 'xai', initialBalance, 'MOMENTUM_TRADING', '#00ff41'),
      new AITrader('CLAUDE', 'anthropic', initialBalance, 'MEAN_REVERSION', '#00ffff'),
      new AITrader('CHATGPT', 'openai', initialBalance, 'TREND_FOLLOWING', '#ff00ff'),
      new AITrader('DEEPSEEK', 'deepseek', initialBalance, 'STATISTICAL_ARBITRAGE', '#ffff00'),
      new AITrader('GEMINI', 'google', initialBalance, 'BREAKOUT_TRADING', '#ff6600')
    ];

    logger.info(`Initialized ${this.aiTraders.length} AI traders`);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Trading engine is already running');
      return;
    }

    this.isRunning = true;
    logger.info('Starting trading engine...');

    this.wsService.broadcast({
      type: 'SYSTEM',
      message: 'Trading engine started. AI traders are analyzing markets...'
    });

    // Main trading loop
    while (this.isRunning) {
      try {
        for (const trader of this.aiTraders) {
          try {
            await this.processTradingCycle(trader);
          } catch (error: any) {
            logger.error(`Error processing trader ${trader.name}:`, error.message);
            trader.status = 'error';
            trader.lastAction = `Error: ${error.message}`;

            this.wsService.broadcast({
              type: 'ERROR',
              error: error.message,
              trader: trader.name
            });
          }
        }

        // Send chart update
        this.sendChartUpdate();

        // Wait for next cycle
        await this.sleep(tradingConfig.tradingIntervalSeconds * 1000);
      } catch (error: any) {
        logger.error('Error in trading loop:', error.message);
      }
    }
  }

  private async processTradingCycle(trader: AITrader): Promise<void> {
    trader.status = 'analyzing';

    // 1. Get market context
    const context = await this.getMarketContext(trader);

    // 2. Get AI decision
    const decision = await this.llmService.getDecision(trader.llmProvider, context);

    // 3. Validate decision
    const validated = this.validateDecision(decision, trader);

    // 4. Execute trade if action required
    if (validated.action !== 'HOLD') {
      trader.status = 'trading';
      const result = await this.executeTrade(validated, trader);

      if (result) {
        trader.updateBalance(result);
        trader.addTrade(result);
      }
    } else {
      trader.status = 'waiting';
    }

    // 5. Update last action
    trader.lastAction = `${validated.action} ${validated.symbol || ''} @ ${validated.leverage || 1}X`;

    // 6. Broadcast updates
    this.wsService.broadcast({
      type: 'TRADER_UPDATE',
      trader: trader.toJSON(),
      timestamp: Date.now()
    });

    this.wsService.broadcast({
      type: 'TRADE_MESSAGE',
      trader: trader.name,
      message: validated.reasoning,
      action: validated.action,
      symbol: validated.symbol,
      timestamp: Date.now()
    });
  }

  private async getMarketContext(trader: AITrader): Promise<TradingContext> {
    const marketData = generateMarketData(this.tradingSymbols);

    return {
      currentBalance: trader.currentBalance,
      openPositions: trader.openPositions,
      marketData,
      accountHistory: {
        totalPnL: trader.totalPnL,
        winRate: trader.winRate,
        totalTrades: trader.totalTrades
      },
      timestamp: Date.now()
    };
  }

  private validateDecision(decision: TradingDecision, trader: AITrader): TradingDecision {
    // If HOLD, return as is
    if (decision.action === 'HOLD') {
      return decision;
    }

    // Check if can open new position
    if ((decision.action === 'OPEN_LONG' || decision.action === 'OPEN_SHORT') && !trader.canOpenPosition()) {
      logger.warn(`${trader.name} cannot open position: max positions reached`);
      return {
        ...decision,
        action: 'HOLD',
        reasoning: 'Cannot open position: maximum positions reached (3/3)'
      };
    }

    // Validate position size
    if (decision.size) {
      const maxSize = trader.currentBalance * (tradingConfig.maxRiskPerTradePercent / 100);
      if (decision.size > maxSize) {
        logger.warn(`${trader.name} position size too large, adjusting from ${decision.size} to ${maxSize}`);
        decision.size = maxSize;
      }
    }

    // Validate leverage
    if (decision.leverage && decision.leverage > tradingConfig.maxLeverage) {
      logger.warn(`${trader.name} leverage too high, adjusting from ${decision.leverage} to ${tradingConfig.maxLeverage}`);
      decision.leverage = tradingConfig.maxLeverage;
    }

    // Check recovery mode
    if (trader.isInRecoveryMode()) {
      logger.info(`${trader.name} is in recovery mode, reducing risk`);
      if (decision.size) decision.size = decision.size * 0.5;
      if (decision.leverage) decision.leverage = Math.min(decision.leverage, 2);
    }

    // Ensure stop loss is set for new positions
    if ((decision.action === 'OPEN_LONG' || decision.action === 'OPEN_SHORT') && !decision.stopLoss) {
      logger.warn(`${trader.name} missing stop loss, setting default`);
      // Set default stop loss at 5% from entry
      const marketData = generateMarketData([decision.symbol]);
      const currentPrice = marketData[0].price;
      decision.stopLoss = decision.action === 'OPEN_LONG'
        ? currentPrice * 0.95
        : currentPrice * 1.05;
    }

    return decision;
  }

  private async executeTrade(decision: TradingDecision, trader: AITrader): Promise<Trade | null> {
    try {
      logger.info(`Executing trade for ${trader.name}: ${decision.action} ${decision.symbol}`);

      // Simulated trade execution (replace with real Hyperliquid API)
      const marketData = generateMarketData([decision.symbol]);
      const currentPrice = marketData[0].price;

      if (decision.action === 'CLOSE_POSITION') {
        // Close existing position
        if (trader.openPositions.length > 0) {
          const position = trader.openPositions[0];
          const pnl = this.calculatePnL(position, currentPrice);

          const trade: Trade = {
            id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            symbol: position.symbol,
            side: position.side,
            entryPrice: position.entryPrice,
            exitPrice: currentPrice,
            size: position.size,
            leverage: position.leverage,
            pnl: pnl,
            pnlPercent: (pnl / (position.size * position.leverage)) * 100,
            reasoning: decision.reasoning,
            strategy: decision.strategy,
            confidence: decision.confidence,
            openedAt: position.openedAt,
            closedAt: new Date()
          };

          trader.removePosition(position.id);
          logger.info(`Position closed: ${trade.id}, P&L: $${pnl.toFixed(2)}`);

          return trade;
        }
      } else if (decision.action === 'OPEN_LONG' || decision.action === 'OPEN_SHORT') {
        // Open new position
        const position: Position = {
          id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          symbol: decision.symbol,
          side: decision.action === 'OPEN_LONG' ? 'LONG' : 'SHORT',
          entryPrice: currentPrice,
          currentPrice: currentPrice,
          size: decision.size || 0,
          leverage: decision.leverage || 1,
          stopLoss: decision.stopLoss || 0,
          takeProfit: decision.takeProfit,
          unrealizedPnL: 0,
          openedAt: new Date()
        };

        trader.addPosition(position);
        logger.info(`Position opened: ${position.id}`);

        // Return null as trade is still open
        return null;
      }

      return null;
    } catch (error: any) {
      logger.error(`Error executing trade for ${trader.name}:`, error.message);
      throw error;
    }
  }

  private calculatePnL(position: Position, exitPrice: number): number {
    const priceDiff = position.side === 'LONG'
      ? exitPrice - position.entryPrice
      : position.entryPrice - exitPrice;

    return (priceDiff / position.entryPrice) * position.size * position.leverage;
  }

  private sendChartUpdate(): void {
    const chartData = this.aiTraders.map(trader => ({
      time: new Date().toLocaleTimeString('en-US', { hour12: false }),
      [trader.name]: trader.currentBalance
    }));

    this.wsService.broadcast({
      type: 'CHART_UPDATE',
      data: chartData,
      timestamp: Date.now()
    });
  }

  stop(): void {
    this.isRunning = false;
    logger.info('Trading engine stopped');

    this.wsService.broadcast({
      type: 'SYSTEM',
      message: 'Trading engine stopped'
    });
  }

  getTraders(): AITrader[] {
    return this.aiTraders;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
