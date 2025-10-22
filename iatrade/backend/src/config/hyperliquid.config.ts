import dotenv from 'dotenv';

dotenv.config();

export const hyperliquidConfig = {
  apiKey: process.env.HYPERLIQUID_API_KEY || '',
  apiSecret: process.env.HYPERLIQUID_API_SECRET || '',
  apiUrl: process.env.HYPERLIQUID_API_URL || 'https://api.hyperliquid.xyz',
  testnet: process.env.HYPERLIQUID_TESTNET === 'true',
  timeout: 10000,
  maxRetries: 3
};

export const tradingConfig = {
  initialBalancePerAI: Number(process.env.INITIAL_BALANCE_PER_AI) || 200,
  tradingIntervalSeconds: Number(process.env.TRADING_INTERVAL_SECONDS) || 45,
  maxPositionsPerAI: Number(process.env.MAX_POSITIONS_PER_AI) || 3,
  maxLeverage: Number(process.env.MAX_LEVERAGE) || 10,
  maxRiskPerTradePercent: Number(process.env.MAX_RISK_PER_TRADE_PERCENT) || 10,
  minBalanceForRecovery: 50
};
