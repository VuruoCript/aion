import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';

const AITrader = () => {
  const [chartData, setChartData] = useState([]);
  const [aiTraders, setAiTraders] = useState([
    {
      name: 'Grok',
      balance: 200,
      color: '#00ff00',
      status: 'analyzing',
      lastAction: 'Initializing...',
      strategy: 'Momentum Trading',
      winRate: 0,
      trades: 0
    },
    {
      name: 'Claude',
      balance: 200,
      color: '#ff6b00',
      status: 'analyzing',
      lastAction: 'Initializing...',
      strategy: 'Mean Reversion',
      winRate: 0,
      trades: 0
    },
    {
      name: 'ChatGPT',
      balance: 200,
      color: '#10a37f',
      status: 'analyzing',
      lastAction: 'Initializing...',
      strategy: 'Trend Following',
      winRate: 0,
      trades: 0
    },
    {
      name: 'DeepSeek',
      balance: 200,
      color: '#8b5cf6',
      status: 'analyzing',
      lastAction: 'Initializing...',
      strategy: 'Arbitrage',
      winRate: 0,
      trades: 0
    },
    {
      name: 'Gemini',
      balance: 200,
      color: '#3b82f6',
      status: 'analyzing',
      lastAction: 'Initializing...',
      strategy: 'Scalping',
      winRate: 0,
      trades: 0
    }
  ]);
  const [messages, setMessages] = useState([]);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const cryptoPairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'ARB/USDT', 'AVAX/USDT'];
  const actions = ['LONG', 'SHORT', 'CLOSE'];
  
  const tradingMessages = [
    (name, pair, action, price) => `${name}: Detectei padrão de alta no ${pair}. Abrindo posição ${action} em $${price}`,
    (name, pair, action) => `${name}: RSI indica sobrevenda em ${pair}. Executando ${action} com stop loss ajustado`,
    (name, pair) => `${name}: Análise de volume mostra acumulação em ${pair}. Ajustando estratégia`,
    (name, profit) => `${name}: Trade fechado com ${profit > 0 ? 'lucro' : 'perda'} de $${Math.abs(profit).toFixed(2)}`,
    (name, pair) => `${name}: Ordem limit colocada em ${pair}. Aguardando preço alvo`,
    (name) => `${name}: Stop loss acionado. Protegendo capital conforme regra de gestão de risco`,
    (name, pair) => `${name}: Rompimento de resistência em ${pair}. Aumentando posição`,
    (name) => `${name}: Mercado lateral detectado. Reduzindo exposição e aguardando sinais claros`,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
      
      setAiTraders(prev => {
        const updated = prev.map(trader => {
          const changePercent = (Math.random() - 0.48) * 4;
          const change = trader.balance * (changePercent / 100);
          const newBalance = Math.max(50, trader.balance + change);
          const tradeWon = change > 0;
          
          const pair = cryptoPairs[Math.floor(Math.random() * cryptoPairs.length)];
          const action = actions[Math.floor(Math.random() * actions.length)];
          const price = (Math.random() * 50000 + 20000).toFixed(2);
          
          const messageTemplate = tradingMessages[Math.floor(Math.random() * tradingMessages.length)];
          let message;
          
          if (messageTemplate.length === 4) {
            message = messageTemplate(trader.name, pair, action, price);
          } else if (messageTemplate.length === 3) {
            message = messageTemplate(trader.name, pair, action);
          } else if (messageTemplate.length === 2 && Math.random() > 0.5) {
            message = messageTemplate(trader.name, change.toFixed(2));
          } else {
            message = messageTemplate(trader.name, pair);
          }
          
          if (Math.random() > 0.6) {
            setMessages(prevMessages => [
              { trader: trader.name, message, timestamp: new Date().toLocaleTimeString(), color: trader.color },
              ...prevMessages.slice(0, 49)
            ]);
          }
          
          return {
            ...trader,
            balance: newBalance,
            lastAction: `${action} ${pair}`,
            status: Math.random() > 0.7 ? 'trading' : 'analyzing',
            trades: trader.trades + 1,
            winRate: ((trader.winRate * trader.trades + (tradeWon ? 100 : 0)) / (trader.trades + 1)).toFixed(1)
          };
        });
        
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const chartInterval = setInterval(() => {
      setChartData(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString()
        };
        
        aiTraders.forEach(trader => {
          newPoint[trader.name] = trader.balance;
        });
        
        const updated = [...prev, newPoint];
        return updated.slice(-30);
      });
    }, 2000);

    return () => clearInterval(chartInterval);
  }, [aiTraders]);

  const totalBalance = aiTraders.reduce((sum, trader) => sum + trader.balance, 0);
  const initialBalance = 1000;
  const totalPnL = totalBalance - initialBalance;
  const totalPnLPercent = ((totalPnL / initialBalance) * 100).toFixed(2);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI CRYPTO TRADERS</h1>
          <p className="text-gray-400">Hyperliquid Futures Trading • Live Competition</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <DollarSign size={16} />
              Total Portfolio
            </div>
            <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
            <div className={`text-sm ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {totalPnL >= 0 ? '+' : ''}{totalPnLPercent}%
            </div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Activity size={16} />
              Active Traders
            </div>
            <div className="text-2xl font-bold">{aiTraders.length}</div>
            <div className="text-sm text-gray-400">All systems operational</div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <TrendingUp size={16} />
              Best Performer
            </div>
            <div className="text-2xl font-bold">
              {[...aiTraders].sort((a, b) => b.balance - a.balance)[0]?.name}
            </div>
            <div className="text-sm text-green-500">
              ${[...aiTraders].sort((a, b) => b.balance - a.balance)[0]?.balance.toFixed(2)}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
              <Activity size={16} />
              Time Elapsed
            </div>
            <div className="text-2xl font-bold">{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</div>
            <div className="text-sm text-gray-400">Live trading</div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4">Portfolio Performance</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis stroke="#666" domain={['dataMin - 20', 'dataMax + 20']} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              {aiTraders.map(trader => (
                <Line
                  key={trader.name}
                  type="monotone"
                  dataKey={trader.name}
                  stroke={trader.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* AI Traders Status */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">AI Traders Status</h2>
            <div className="space-y-4">
              {[...aiTraders].sort((a, b) => b.balance - a.balance).map((trader, idx) => (
                <div key={trader.name} className="border border-zinc-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-gray-500">#{idx + 1}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: trader.color }}
                          />
                          <span className="font-bold text-lg">{trader.name}</span>
                        </div>
                        <div className="text-sm text-gray-400">{trader.strategy}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">${trader.balance.toFixed(2)}</div>
                      <div className={`text-sm ${trader.balance >= 200 ? 'text-green-500' : 'text-red-500'}`}>
                        {trader.balance >= 200 ? '+' : ''}{((trader.balance - 200) / 200 * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-3 pt-3 border-t border-zinc-800">
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className="ml-2 text-yellow-500">{trader.status}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Win Rate:</span>
                      <span className="ml-2 text-green-500">{trader.winRate}%</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">Last Action:</span>
                      <span className="ml-2">{trader.lastAction}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Feed */}
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Live Trading Feed</h2>
            <div className="space-y-2 h-[600px] overflow-y-auto">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className="border border-zinc-800 p-3 rounded text-sm hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: msg.color }}
                    />
                    <span className="font-bold">{msg.trader}</span>
                    <span className="text-gray-500 text-xs ml-auto">{msg.timestamp}</span>
                  </div>
                  <div className="text-gray-300 ml-4">{msg.message}</div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Aguardando atividade de trading...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITrader;