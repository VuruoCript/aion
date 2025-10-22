// Vercel Serverless Function - Pure JavaScript
// GET /api/state

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Simple in-memory state for serverless
  const initialAITraders = [
    { name: 'GROK', balance: 200, status: 'analyzing', strategy: 'Momentum Trading', winRate: 0, trades: 0, totalPnL: 0, color: '#000000' },
    { name: 'CLAUDE', balance: 200, status: 'analyzing', strategy: 'Mean Reversion', winRate: 0, trades: 0, totalPnL: 0, color: '#f47855' },
    { name: 'CHATGPT', balance: 200, status: 'analyzing', strategy: 'Trend Following', winRate: 0, trades: 0, totalPnL: 0, color: '#009a57' },
    { name: 'DEEPSEEK', balance: 200, status: 'analyzing', strategy: 'Statistical Arbitrage', winRate: 0, trades: 0, totalPnL: 0, color: '#396bff' },
    { name: 'GEMINI', balance: 200, status: 'analyzing', strategy: 'Breakout Trading', winRate: 0, trades: 0, totalPnL: 0, color: '#9068c1' }
  ];

  try {
    // Generate mock state with some randomness
    const traders = initialAITraders.map(trader => {
      const statusOptions = ['analyzing', 'trading', 'waiting'];
      const randomBalance = trader.balance + (Math.random() - 0.5) * 50;
      const randomStatus = statusOptions[Math.floor(Math.random() * 3)];
      const randomTrades = Math.floor(Math.random() * 100);
      const randomWinRate = 50 + (Math.random() - 0.5) * 20;
      const randomPnL = (Math.random() - 0.5) * 100;

      return {
        ...trader,
        balance: randomBalance,
        status: randomStatus,
        trades: randomTrades,
        winRate: randomWinRate,
        totalPnL: randomPnL
      };
    });

    const now = new Date();
    const chartData = [];

    for (let i = 0; i < 10; i++) {
      const time = new Date(now.getTime() - (9 - i) * 5000);
      const hours = String(time.getHours()).padStart(2, '0');
      const minutes = String(time.getMinutes()).padStart(2, '0');
      const point = {
        time: `${hours}:${minutes}`
      };

      traders.forEach(trader => {
        point[trader.name] = trader.balance + (Math.random() - 0.5) * 10;
      });

      chartData.push(point);
    }

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${hours}:${minutes}:${seconds}`;

    const messages = [
      {
        trader: 'SYSTEM',
        message: '⚠️ Running in serverless mode. For real-time trading, deploy backend to Railway or Render.',
        timestamp: timestamp
      },
      {
        trader: 'GROK',
        message: '📊 Analyzing market momentum... BTC looking bullish!',
        timestamp: timestamp
      },
      {
        trader: 'CLAUDE',
        message: '🔄 Mean reversion strategy active. Waiting for entry signal.',
        timestamp: timestamp
      }
    ];

    const responseData = {
      aiTraders: traders,
      chartData: chartData,
      messages: messages,
      timeElapsed: Math.floor(Date.now() / 1000) % 3600,
      serverless: true
    };

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Error in /api/state:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      serverless: true
    });
  }
};
