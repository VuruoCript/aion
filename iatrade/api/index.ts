import type { VercelRequest, VercelResponse } from '@vercel/node';

// Simple in-memory state for serverless
const initialAITraders = [
  { name: 'GROK', balance: 200, status: 'analyzing' as const, strategy: 'Momentum Trading', winRate: 0, trades: 0, totalPnL: 0, color: '#000000' },
  { name: 'CLAUDE', balance: 200, status: 'analyzing' as const, strategy: 'Mean Reversion', winRate: 0, trades: 0, totalPnL: 0, color: '#f47855' },
  { name: 'CHATGPT', balance: 200, status: 'analyzing' as const, strategy: 'Trend Following', winRate: 0, trades: 0, totalPnL: 0, color: '#009a57' },
  { name: 'DEEPSEEK', balance: 200, status: 'analyzing' as const, strategy: 'Statistical Arbitrage', winRate: 0, trades: 0, totalPnL: 0, color: '#396bff' },
  { name: 'GEMINI', balance: 200, status: 'analyzing' as const, strategy: 'Breakout Trading', winRate: 0, trades: 0, totalPnL: 0, color: '#9068c1' }
];

// Generate simple messages
function generateMessage(traderName: string, balance: number, previousBalance: number): string {
  const change = balance - previousBalance;
  const changePercent = ((change / previousBalance) * 100).toFixed(2);

  if (change > 0) {
    return `✅ ${traderName}: Profitable trade! Balance: $${balance.toFixed(2)} (+${changePercent}%)`;
  } else {
    return `❌ ${traderName}: Trade closed. Balance: $${balance.toFixed(2)} (${changePercent}%)`;
  }
}

// Main serverless function
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { pathname } = new URL(req.url || '/', `http://${req.headers.host}`);

  // Health check endpoint
  if (pathname === '/api/health' || pathname === '/health') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: 'vercel-serverless',
      note: 'For full WebSocket support, use Railway or Render deployment'
    });
  }

  // Get current state endpoint
  if (pathname === '/api/state' || pathname === '/state') {
    // Generate mock state
    const traders = initialAITraders.map(trader => ({
      ...trader,
      balance: trader.balance + (Math.random() - 0.5) * 50,
      status: ['analyzing', 'trading', 'waiting'][Math.floor(Math.random() * 3)] as any,
      trades: Math.floor(Math.random() * 100),
      winRate: Math.random() * 100
    }));

    const chartData = Array.from({ length: 10 }, (_, i) => {
      const point: any = { time: `${String(new Date().getHours()).padStart(2, '0')}:${String(i).padStart(2, '0')}` };
      traders.forEach(trader => {
        point[trader.name] = trader.balance;
      });
      return point;
    });

    return res.status(200).json({
      aiTraders: traders,
      chartData,
      messages: [
        {
          trader: 'SYSTEM',
          message: '⚠️ Running in serverless mode. For real-time trading, deploy backend to Railway or Render.',
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
        }
      ],
      timeElapsed: Math.floor(Date.now() / 1000) % 3600
    });
  }

  // Start endpoint (no-op in serverless)
  if (pathname === '/api/start' && req.method === 'POST') {
    return res.status(200).json({
      message: 'Serverless mode - trading engine cannot be started/stopped',
      note: 'Use Railway or Render for persistent backend'
    });
  }

  // Stop endpoint (no-op in serverless)
  if (pathname === '/api/stop' && req.method === 'POST') {
    return res.status(200).json({
      message: 'Serverless mode - trading engine cannot be started/stopped',
      note: 'Use Railway or Render for persistent backend'
    });
  }

  // Reset endpoint (no-op in serverless)
  if (pathname === '/api/reset' && req.method === 'POST') {
    return res.status(200).json({
      message: 'State reset (simulated in serverless mode)',
      state: {
        aiTraders: initialAITraders,
        chartData: [],
        messages: [],
        timeElapsed: 0
      }
    });
  }

  // Default response
  return res.status(404).json({
    error: 'Not Found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/state',
      'POST /api/start',
      'POST /api/stop',
      'POST /api/reset'
    ]
  });
}
