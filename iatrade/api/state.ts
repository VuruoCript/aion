import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory state for serverless
const initialAITraders = [
  { name: 'GROK', balance: 200, status: 'analyzing' as const, strategy: 'Momentum Trading', winRate: 0, trades: 0, totalPnL: 0, color: '#000000' },
  { name: 'CLAUDE', balance: 200, status: 'analyzing' as const, strategy: 'Mean Reversion', winRate: 0, trades: 0, totalPnL: 0, color: '#f47855' },
  { name: 'CHATGPT', balance: 200, status: 'analyzing' as const, strategy: 'Trend Following', winRate: 0, trades: 0, totalPnL: 0, color: '#009a57' },
  { name: 'DEEPSEEK', balance: 200, status: 'analyzing' as const, strategy: 'Statistical Arbitrage', winRate: 0, trades: 0, totalPnL: 0, color: '#396bff' },
  { name: 'GEMINI', balance: 200, status: 'analyzing' as const, strategy: 'Breakout Trading', winRate: 0, trades: 0, totalPnL: 0, color: '#9068c1' }
];

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Generate mock state with some randomness
  const traders = initialAITraders.map(trader => ({
    ...trader,
    balance: trader.balance + (Math.random() - 0.5) * 50,
    status: ['analyzing', 'trading', 'waiting'][Math.floor(Math.random() * 3)] as any,
    trades: Math.floor(Math.random() * 100),
    winRate: 50 + (Math.random() - 0.5) * 20,
    totalPnL: (Math.random() - 0.5) * 100
  }));

  const now = new Date();
  const chartData = Array.from({ length: 10 }, (_, i) => {
    const time = new Date(now.getTime() - (9 - i) * 5000);
    const point: any = {
      time: time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };
    traders.forEach(trader => {
      point[trader.name] = trader.balance + (Math.random() - 0.5) * 10;
    });
    return point;
  });

  const messages = [
    {
      trader: 'SYSTEM',
      message: '⚠️ Running in serverless mode. For real-time trading, deploy backend to Railway or Render.',
      timestamp: now.toLocaleTimeString('en-US', { hour12: false })
    },
    {
      trader: 'GROK',
      message: '📊 Analyzing market momentum... BTC looking bullish!',
      timestamp: now.toLocaleTimeString('en-US', { hour12: false })
    },
    {
      trader: 'CLAUDE',
      message: '🔄 Mean reversion strategy active. Waiting for entry signal.',
      timestamp: now.toLocaleTimeString('en-US', { hour12: false })
    }
  ];

  return res.status(200).json({
    aiTraders: traders,
    chartData,
    messages,
    timeElapsed: Math.floor(Date.now() / 1000) % 3600,
    serverless: true
  });
}
