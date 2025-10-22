export interface MarketData {
  symbol: string;
  price: number;
  volume24h: number;
  priceChange24h: number;
  high24h: number;
  low24h: number;
  timestamp: number;
}

export interface OrderBook {
  bids: [number, number][]; // [price, size]
  asks: [number, number][];
  timestamp: number;
}

export interface TradingContext {
  currentBalance: number;
  openPositions: any[];
  marketData: MarketData[];
  accountHistory: {
    totalPnL: number;
    winRate: number;
    totalTrades: number;
  };
  timestamp: number;
}

// Simulated market data generator (replace with real Hyperliquid API)
export function generateMarketData(symbols: string[]): MarketData[] {
  return symbols.map(symbol => ({
    symbol,
    price: Math.random() * 50000 + 20000,
    volume24h: Math.random() * 1000000000,
    priceChange24h: (Math.random() - 0.5) * 10,
    high24h: Math.random() * 55000 + 20000,
    low24h: Math.random() * 45000 + 15000,
    timestamp: Date.now()
  }));
}

export function generateOrderBook(symbol: string): OrderBook {
  const basePrice = Math.random() * 50000 + 20000;
  const bids: [number, number][] = [];
  const asks: [number, number][] = [];

  for (let i = 0; i < 10; i++) {
    bids.push([basePrice - i * 10, Math.random() * 10]);
    asks.push([basePrice + i * 10, Math.random() * 10]);
  }

  return {
    bids,
    asks,
    timestamp: Date.now()
  };
}
