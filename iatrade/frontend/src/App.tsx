import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart, ReferenceLine } from 'recharts';
import { TrendingUp, Activity, DollarSign, Send, Info, Moon, Sun, Copy, Check } from 'lucide-react';
import { X } from 'lucide-react';
import { useSocket } from './hooks/useSocket';
import {
  generateGrokMessage,
  generateClaudeMessage,
  generateChatGPTMessage,
  generateDeepSeekMessage,
  generateGeminiMessage
} from './messageGenerator';

// Import logos
import grokLogo from './assets/images/grok.png';
import claudeLogo from './assets/images/claude.png';
import gptLogo from './assets/images/gpt.png';
import deepseekLogo from './assets/images/deepseek.png';
import geminiLogo from './assets/images/gemini.png';
import logo2 from './assets/images/logo2.png';
import logo3black from './assets/images/logo3black.png';

interface AITrader {
  name: string;
  balance: number;
  status: 'analyzing' | 'trading' | 'waiting';
  strategy: string;
  winRate: number;
  trades: number;
  totalPnL: number;
  color: string;
  logo: string;
}

// Custom dot component for chart line endpoints with logo
const CustomDot = (props: any) => {
  const { cx, cy, payload, dataKey, aiTraders, onClick } = props;

  // Only render on the last point
  if (!payload || payload.time !== props.chartData[props.chartData.length - 1]?.time) {
    return null;
  }

  const trader = aiTraders.find((t: AITrader) => t.name === dataKey);
  if (!trader) return null;

  const currentValue = trader.balance;
  const formattedValue = `$${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <g
      style={{ transition: 'all 1s ease-out', cursor: 'pointer' }}
      onClick={() => onClick && onClick(trader.name)}
    >
      {/* Pulsing circle effect - stronger */}
      <circle
        cx={cx}
        cy={cy}
        r={30}
        fill={trader.color}
        opacity={0.4}
        style={{ transition: 'all 1s ease-out' }}
      >
        <animate attributeName="r" values="30;40;30" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle
        cx={cx}
        cy={cy}
        r={20}
        fill={trader.color}
        opacity={0.6}
        style={{ transition: 'all 1s ease-out' }}
      >
        <animate attributeName="r" values="20;25;20" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
      </circle>
      {/* Logo image */}
      <image
        x={cx - 12}
        y={cy - 12}
        width={24}
        height={24}
        href={trader.logo}
        style={{ borderRadius: '50%', transition: 'all 1s ease-out' }}
      />
      {/* Fixed tooltip with current value - positioned to the right */}
      <g>
        {/* Tooltip background */}
        <rect
          x={cx + 35}
          y={cy - 10}
          width={90}
          height={20}
          rx={4}
          fill="rgba(0, 0, 0, 0.95)"
          stroke={trader.color}
          strokeWidth={1.5}
        />
        {/* Tooltip arrow */}
        <polygon
          points={`${cx + 35},${cy} ${cx + 30},${cy - 5} ${cx + 30},${cy + 5}`}
          fill="rgba(0, 0, 0, 0.95)"
        />
        {/* Tooltip value - digital clock style */}
        <text
          x={cx + 80}
          y={cy + 4}
          textAnchor="middle"
          fill="#00ff41"
          fontSize="11"
          fontWeight="bold"
          fontFamily="'Courier New', monospace"
          style={{ transition: 'all 0.3s ease-out' }}
        >
          {formattedValue}
        </text>
      </g>
    </g>
  );
};

// Custom Tooltip with formatted values
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        border: '1px solid #4dffa1',
        borderRadius: '6px',
        padding: '12px',
        color: '#ffffff'
      }}>
        <p style={{ marginBottom: '8px', fontWeight: 'bold', color: '#4dffa1' }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: '4px 0', fontSize: '12px' }}>
            <span style={{ color: entry.name === 'GROK' ? '#a0a0a0' : entry.color }}>{entry.name}: </span>
            <span style={{ fontWeight: 'bold' }}>
              ${typeof entry.value === 'number' ? entry.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface TradeMessage {
  trader: string;
  message: string;
  timestamp: string;
}

interface ChartDataPoint {
  time: string;
  [key: string]: number | string;
}

interface CryptoPrice {
  symbol: string;
  price: number;
  change24h: number;
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initializing system...');
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode

  // Use Socket.IO hook for real-time data
  const { connected, aiTraders: rawAiTraders, chartData, messages, timeElapsed } = useSocket();

  // Add logos to traders from backend
  const aiTraders = rawAiTraders.map((trader: any) => ({
    ...trader,
    logo: trader.name === 'GROK' ? grokLogo :
          trader.name === 'CLAUDE' ? claudeLogo :
          trader.name === 'CHATGPT' ? gptLogo :
          trader.name === 'DEEPSEEK' ? deepseekLogo :
          trader.name === 'GEMINI' ? geminiLogo : grokLogo
  }));

  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([
    { symbol: 'BTC', price: 0, change24h: 0 },
    { symbol: 'ETH', price: 0, change24h: 0 },
    { symbol: 'SOL', price: 0, change24h: 0 },
    { symbol: 'BNB', price: 0, change24h: 0 },
    { symbol: 'DOGE', price: 0, change24h: 0 },
    { symbol: 'XRP', price: 0, change24h: 0 }
  ]);
  const [selectedTraderFilter, setSelectedTraderFilter] = useState<string>('ALL');
  const [liveFeedTab, setLiveFeedTab] = useState<'feed' | 'about'>('feed');
  const [selectedChartTrader, setSelectedChartTrader] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'leaderboard'>('dashboard');
  const [chartTimeframe, setChartTimeframe] = useState<'ALL' | '15M' | '1H' | '4H'>('ALL');
  const [chartDisplayMode, setChartDisplayMode] = useState<'$' | '%'>('$');
  const [hoveredTrader, setHoveredTrader] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const CONTRACT_ADDRESS = '0xc52469466e4b7cc92c6410a7ad40165ce3974444';

  // Copy contract address function
  const copyContractAddress = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // All trading logic is now handled by the backend via Socket.IO

  // Loading effect
  useEffect(() => {
    const messages = [
      'Initializing system...',
      'Loading AI models...',
      'Connecting to Aster...',
      'Initializing GROK trader...',
      'Initializing CLAUDE trader...',
      'Initializing CHATGPT trader...',
      'Initializing DEEPSEEK trader...',
      'Initializing GEMINI trader...',
      'Starting trading engine...',
      'System ready!'
    ];

    let currentStep = 0;
    const totalSteps = messages.length;

    const loadingInterval = setInterval(() => {
      if (currentStep < totalSteps) {
        setLoadingMessage(messages[currentStep]);
        setProgress(((currentStep + 1) / totalSteps) * 100);
        currentStep++;
      } else {
        clearInterval(loadingInterval);
        setTimeout(() => setLoading(false), 500);
      }
    }, 400);

    return () => clearInterval(loadingInterval);
  }, []);

  // Trading, runtime and chart updates are now handled by backend via Socket.IO

  // Fetch crypto prices in real-time using Binance WebSocket and REST API
  useEffect(() => {
    const symbols = [
      { binance: 'BTCUSDT', symbol: 'BTC' },
      { binance: 'ETHUSDT', symbol: 'ETH' },
      { binance: 'SOLUSDT', symbol: 'SOL' },
      { binance: 'BNBUSDT', symbol: 'BNB' },
      { binance: 'DOGEUSDT', symbol: 'DOGE' },
      { binance: 'XRPUSDT', symbol: 'XRP' }
    ];

    // Store for 24h price changes
    const priceChanges: { [key: string]: number } = {};

    // Fetch 24h statistics from Binance
    const fetch24hStats = async () => {
      try {
        for (const { binance, symbol } of symbols) {
          const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binance}`);
          const data = await response.json();
          priceChanges[symbol] = parseFloat(data.priceChangePercent || '0');
        }
      } catch (error) {
        console.error('Error fetching 24h stats:', error);
      }
    };

    // Initial fetch of 24h stats
    fetch24hStats();

    // Update 24h stats every 60 seconds
    const statsInterval = setInterval(fetch24hStats, 60000);

    // WebSocket connections for real-time price updates
    const streams = symbols.map(s => `${s.binance.toLowerCase()}@ticker`).join('/');
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.data) {
          const ticker = message.data;
          const symbolInfo = symbols.find(s => s.binance === ticker.s);

          if (symbolInfo) {
            setCryptoPrices(prev => {
              const newPrices = [...prev];
              const index = newPrices.findIndex(p => p.symbol === symbolInfo.symbol);
              if (index !== -1) {
                newPrices[index] = {
                  symbol: symbolInfo.symbol,
                  price: parseFloat(ticker.c),
                  change24h: priceChanges[symbolInfo.symbol] || parseFloat(ticker.P)
                };
              }
              return newPrices;
            });
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    return () => {
      ws.close();
      clearInterval(statsInterval);
    };
  }, []);

  const totalBalance = aiTraders.reduce((sum, trader) => sum + trader.balance, 0);
  const totalPnL = totalBalance - 1000;
  const totalPnLPercent = ((totalPnL / 1000) * 100).toFixed(2);
  const totalTrades = aiTraders.reduce((sum, trader) => sum + trader.trades, 0);

  // Apply dark mode class to body
  useEffect(() => {
    document.body.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  // Loading Screen - Keep black for loading
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-[#00d28a] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-12">
            <img src="/logo.png" alt="Logo" className="h-[200px] sm:h-[256px] md:h-[300px] opacity-80 animate-pulse" />
          </div>

          {/* Loading Message */}
          <div className="mb-8 text-center">
            <p className="text-xl font-mono mb-2">{loadingMessage}</p>
            <p className="text-sm text-white/60 font-mono">
              C:\SYSTEM\AI_TRADING&gt; LOADING...
            </p>
          </div>

          {/* CMD-style Progress Bar */}
          <div className="border border-[#00d28a] p-6">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-mono">PROGRESS:</span>
                <span className="text-sm font-mono">{Math.floor(progress)}%</span>
              </div>
              {/* Progress Bar Container */}
              <div className="border border-[#00d28a] h-8 relative overflow-hidden">
                {/* Progress Fill */}
                <div
                  className="h-full bg-[#00d28a] transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
                {/* CMD Block Characters */}
                <div className="absolute top-0 left-0 w-full h-full flex items-center px-2">
                  <span className="text-black font-mono text-sm font-bold" style={{ mixBlendMode: 'difference' }}>
                    {Array(Math.floor(progress / 2.5)).fill('█').join('')}
                  </span>
                </div>
              </div>
            </div>

            {/* Loading Steps */}
            <div className="space-y-1 text-xs font-mono text-white/60">
              <p>[OK] System initialization</p>
              <p>[OK] Neural network loading</p>
              <p>[OK] Blockchain connection</p>
              {progress > 30 && <p>[OK] AI agents deployment</p>}
              {progress > 60 && <p>[OK] Trading engine setup</p>}
              {progress > 90 && <p className="text-[#00d28a]">[OK] Ready to trade</p>}
            </div>
          </div>

          {/* Blinking Cursor */}
          <div className="mt-6 font-mono text-sm">
            <span className="text-white/60">$</span>
            <span className="animate-pulse ml-2">_</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-2 sm:p-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="max-w-[1920px] mx-auto space-y-2 sm:space-y-4">

        {/* Header */}
        <div className="fade-in mb-2">
          <div className="relative flex items-center justify-center">
            {/* Logo - Increased size */}
            <img src={darkMode ? logo2 : logo3black} alt="Logo" className="h-36 sm:h-48 md:h-60 lg:h-72 opacity-90 hover:opacity-100 transition-opacity" />

            {/* Theme Toggle - Top Right */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`absolute right-0 top-0 p-2 sm:p-3 rounded-lg transition-all ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {darkMode ? <Sun size={20} className="text-[#00d28a] sm:w-6 sm:h-6" /> : <Moon size={20} className="text-gray-700 sm:w-6 sm:h-6" />}
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="flex justify-center gap-2 sm:gap-4 mt-3 sm:mt-4">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                currentPage === 'dashboard'
                  ? darkMode ? 'bg-[#00d28a] text-black' : 'bg-black text-white'
                  : darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              DASHBOARD
            </button>
            <button
              onClick={() => setCurrentPage('leaderboard')}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                currentPage === 'leaderboard'
                  ? darkMode ? 'bg-[#00d28a] text-black' : 'bg-black text-white'
                  : darkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              LEADERBOARD
            </button>
            <a
              href="https://gmgn.ai/bsc/token/0xc52469466e4b7cc92c6410a7ad40165ce3974444"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold rounded-lg transition-all text-center ${darkMode ? 'bg-[#00d28a] text-black hover:bg-[#00d28a]/80' : 'bg-black text-white hover:bg-black/80'}`}
            >
              BUY NOW
            </a>
          </div>
        </div>

        {/* Leaderboard Page */}
        {currentPage === 'leaderboard' && (
        <div className={`rounded-lg p-3 sm:p-6 fade-in ${darkMode ? 'glass' : 'glass-light border border-gray-300'}`}>
          <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>LEADERBOARD</h2>

          {/* Winning Model - Highlighted */}
          <div className={`rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 border-2 ${darkMode ? 'bg-[#00d28a]/10 border-[#00d28a]' : 'bg-green-50 border-green-500'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="text-center sm:text-left w-full sm:w-auto">
                  <div className={`text-xs font-bold ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>WINNING MODEL</div>
                  <div className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {[...aiTraders].sort((a, b) => b.balance - a.balance)[0]?.name || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="text-center sm:text-right w-full sm:w-auto">
                <div className={`text-xs font-bold ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>TOTAL EQUITY</div>
                <div className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-[#00d28a]' : 'text-green-600'}`}>
                  ${([...aiTraders].sort((a, b) => b.balance - a.balance)[0]?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className={`border-b-2 ${darkMode ? 'border-white/20' : 'border-gray-300'}`}>
                  <th className={`text-left py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-bold ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>RANK</th>
                  <th className={`text-left py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-bold ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>MODEL</th>
                  <th className={`text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-bold ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>EQUITY</th>
                  <th className={`text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-bold ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>RETURN %</th>
                  <th className={`text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-bold ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>P&L</th>
                  <th className={`text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-bold ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>POS</th>
                  <th className={`text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-bold ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>WIN %</th>
                  <th className={`text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-bold ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>L.WIN</th>
                  <th className={`text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-bold ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>L.LOSS</th>
                  <th className={`text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-bold ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>TRADES</th>
                  <th className={`text-right py-2 sm:py-3 px-2 sm:px-4 text-[10px] sm:text-xs font-bold ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>SYMBOL</th>
                </tr>
              </thead>
              <tbody>
                {[...aiTraders].sort((a, b) => b.balance - a.balance).map((trader, index) => {
                  const returnPercent = ((trader.balance - 200) / 200) * 100;
                  return (
                    <tr key={trader.name} className={`border-b ${darkMode ? 'border-white/10' : 'border-gray-200'} hover:${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <td className={`py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{index + 1}</td>
                      <td className="py-2 sm:py-3 px-2 sm:px-4">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: trader.color }}></div>
                          <span className={`text-xs sm:text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{trader.name}</span>
                        </div>
                      </td>
                      <td className={`py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${trader.balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className={`py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm font-bold ${returnPercent >= 0 ? 'text-[#00ff41]' : 'text-red-500'}`}>
                        {returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(1)}%
                      </td>
                      <td className={`py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm font-bold ${trader.totalPnL >= 0 ? 'text-[#00ff41]' : 'text-red-500'}`}>
                        ${Math.abs(trader.totalPnL).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td className={`py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                        {trader.status === 'trading' ? '1' : '0'}
                      </td>
                      <td className={`py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                        {trader.winRate.toFixed(0)}%
                      </td>
                      <td className={`py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                        {Math.floor(trader.winRate / 10)}
                      </td>
                      <td className={`py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                        {Math.floor((100 - trader.winRate) / 10)}
                      </td>
                      <td className={`py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                        {trader.trades}
                      </td>
                      <td className={`py-2 sm:py-3 px-2 sm:px-4 text-right text-xs sm:text-sm ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                        {trader.name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Active Positions Bar Chart */}
          <div className="mt-4 sm:mt-6">
            <h3 className={`text-xs sm:text-sm font-bold mb-3 sm:mb-4 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>ACTIVE POSITIONS</h3>
            <div className="grid grid-cols-5 gap-2 sm:gap-4">
              {[...aiTraders].sort((a, b) => b.balance - a.balance).map((trader) => (
                <div key={trader.name} className="text-center">
                  <div className="relative h-24 sm:h-32 flex items-end justify-center mb-2">
                    <div
                      className="w-full rounded-t-lg transition-all duration-500"
                      style={{
                        backgroundColor: trader.color,
                        height: `${(trader.balance / Math.max(...aiTraders.map(t => t.balance))) * 100}%`,
                        minHeight: '20px'
                      }}
                    >
                      <div className="absolute -top-5 sm:-top-6 left-0 right-0 text-center">
                        <div className={`text-[10px] sm:text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          ${trader.balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                    <img src={trader.logo} alt={trader.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                    <div className={`text-[10px] sm:text-xs font-bold ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                      {trader.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Dashboard Page */}
        {currentPage === 'dashboard' && (
        <>
        {/* Contract Address */}
        <div className="fade-in mb-3">
          <h3 className={`text-sm sm:text-base font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>CONTRACT ADDRESS</h3>
          <div className="max-w-2xl">
            <div className={`flex items-center gap-2 rounded-lg p-3 ${darkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
              <input
                type="text"
                value={CONTRACT_ADDRESS}
                readOnly
                className={`flex-1 text-xs sm:text-sm md:text-base font-mono px-3 py-2 rounded ${darkMode ? 'bg-black/30 text-white border border-[#00d28a]/30' : 'bg-white text-gray-900 border border-gray-300'} focus:outline-none`}
              />
              <div className="relative flex items-center gap-2">
                <button
                  onClick={copyContractAddress}
                  className={`p-2 sm:p-2.5 rounded transition-all ${darkMode ? 'bg-[#00d28a]/20 hover:bg-[#00d28a]/30 text-[#00d28a]' : 'bg-black/10 hover:bg-black/20 text-gray-700'}`}
                  title="Copy contract address"
                >
                  {copied ? <Check size={20} className="sm:w-6 sm:h-6" /> : <Copy size={20} className="sm:w-6 sm:h-6" />}
                </button>
                {/* Copied Tooltip - Right side */}
                {copied && (
                  <div className={`absolute left-full ml-3 px-4 py-2 rounded text-sm font-bold whitespace-nowrap animate-fade-in ${darkMode ? 'bg-[#00d28a] text-black' : 'bg-black text-white'}`}>
                    Copied!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 fade-in">
          <div className={`rounded-lg p-3 sm:p-4 stats-card-green ${darkMode ? 'glass border border-[#00d28a]/30' : 'glass-light border border-gray-300'}`}>
            <div className={`flex items-center gap-2 mb-2 text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
              <DollarSign size={14} />
              <span>TOTAL PORTFOLIO</span>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`text-sm font-bold ${totalPnL >= 0 ? 'text-[#00ff41]' : 'text-red-500'}`}>
              {totalPnL >= 0 ? '+' : ''}{parseFloat(totalPnLPercent).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
            </div>
          </div>

          <div className={`rounded-lg p-3 sm:p-4 stats-card-green ${darkMode ? 'glass border border-[#00d28a]/30' : 'glass-light border border-gray-300'}`}>
            <div className={`flex items-center gap-2 mb-2 text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
              <Activity size={14} />
              <span>ACTIVE TRADERS</span>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{aiTraders.length}</div>
            <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>ALL SYSTEMS ONLINE</div>
          </div>

          <div className={`rounded-lg p-3 sm:p-4 stats-card-green ${darkMode ? 'glass border border-[#00d28a]/30' : 'glass-light border border-gray-300'}`}>
            <div className={`flex items-center gap-2 mb-2 text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
              <TrendingUp size={14} />
              <span>TOP PERFORMER</span>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {[...aiTraders].sort((a, b) => b.balance - a.balance)[0]?.name}
            </div>
            <div className={`text-sm font-bold ${darkMode ? 'text-[#00d28a]' : 'text-[#00d28a]'}`}>
              ${[...aiTraders].sort((a, b) => b.balance - a.balance)[0]?.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className={`rounded-lg p-3 sm:p-4 stats-card-green ${darkMode ? 'glass border border-[#00d28a]/30' : 'glass-light border border-gray-300'}`}>
            <div className={`flex items-center gap-2 mb-2 text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>
              <Activity size={14} />
              <span>RUNTIME</span>
            </div>
            <div className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {Math.floor(timeElapsed / 3600).toString().padStart(2, '0')}:{Math.floor((timeElapsed % 3600) / 60).toString().padStart(2, '0')}:{(timeElapsed % 60).toString().padStart(2, '0')}
            </div>
            <div className={`text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>HOURS:MINUTES:SECONDS</div>
          </div>
        </div>

        {/* Crypto Prices Card */}
        <div className={`rounded-lg p-2 sm:p-3 fade-in ${darkMode ? 'glass' : 'glass-light border border-gray-300'}`}>
          <h2 className={`text-base sm:text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>LIVE CRYPTO PRICES</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {cryptoPrices.map((crypto) => (
              <div key={crypto.symbol} className={`rounded-lg p-2 transition-all ${darkMode ? 'bg-white/5 hover:bg-white/10 border border-white/10' : 'border border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={`https://assets.coincap.io/assets/icons/${crypto.symbol.toLowerCase()}@2x.png`}
                    alt={crypto.symbol}
                    className="w-6 h-6 sm:w-8 sm:h-8"
                    onError={(e) => {
                      // Fallback para emoji se a imagem não carregar
                      e.currentTarget.outerHTML = `<div class="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-xl sm:text-2xl">${
                        crypto.symbol === 'BTC' ? '₿' :
                        crypto.symbol === 'ETH' ? 'Ξ' :
                        crypto.symbol === 'SOL' ? '◎' :
                        crypto.symbol === 'BNB' ? '⬡' :
                        crypto.symbol === 'DOGE' ? 'Ð' :
                        crypto.symbol === 'XRP' ? '✕' : '●'
                      }</div>`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className={`text-sm sm:text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{crypto.symbol}</span>
                      <div className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap ${crypto.change24h >= 0 ? (darkMode ? 'bg-green-900/30 text-[#00ff41]' : 'bg-green-100 text-green-600') : (darkMode ? 'bg-red-900/30 text-red-500' : 'bg-red-100 text-red-500')}`}>
                        {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`text-lg sm:text-2xl font-bold truncate ${crypto.price > 0 ? (crypto.change24h >= 0 ? 'text-[#00ff41]' : 'text-red-500') : (darkMode ? 'text-white' : 'text-gray-900')}`}>
                  ${crypto.price >= 1 ? crypto.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : crypto.price.toFixed(6)}
                </div>
                <div className={`text-[10px] sm:text-xs mt-1 ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>24h Change</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart and Live Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-4 fade-in">
          {/* Chart - 2 columns on desktop, full width on mobile */}
          <div className={`lg:col-span-2 rounded-lg p-2 sm:p-3 ${darkMode ? 'glass' : 'glass-light border border-gray-300'}`}>
            <div className="mb-2 sm:mb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-2">
                <h2 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>TOTAL ACCOUNT VALUE</h2>
                <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
                  {selectedChartTrader && (
                    <button
                      onClick={() => setSelectedChartTrader(null)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded whitespace-nowrap ${darkMode ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'bg-gray-200 hover:bg-gray-300 text-black border border-gray-300'}`}
                    >
                      ← BACK
                    </button>
                  )}
                <button
                  onClick={() => setChartTimeframe('15M')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded whitespace-nowrap ${chartTimeframe === '15M' ? (darkMode ? 'bg-[#00d28a] text-black' : 'bg-black text-white') : (darkMode ? 'border border-[#00d28a] text-white' : 'border border-black text-black')}`}
                >
                  15M
                </button>
                <button
                  onClick={() => setChartTimeframe('1H')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded whitespace-nowrap ${chartTimeframe === '1H' ? (darkMode ? 'bg-[#00d28a] text-black' : 'bg-black text-white') : (darkMode ? 'border border-[#00d28a] text-white' : 'border border-black text-black')}`}
                >
                  1H
                </button>
                <button
                  onClick={() => setChartTimeframe('4H')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded whitespace-nowrap ${chartTimeframe === '4H' ? (darkMode ? 'bg-[#00d28a] text-black' : 'bg-black text-white') : (darkMode ? 'border border-[#00d28a] text-white' : 'border border-black text-black')}`}
                >
                  4H
                </button>
                <button
                  onClick={() => setChartTimeframe('ALL')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded whitespace-nowrap ${chartTimeframe === 'ALL' ? (darkMode ? 'bg-[#00d28a] text-black' : 'bg-black text-white') : (darkMode ? 'border border-[#00d28a] text-white' : 'border border-black text-black')}`}
                >
                  ALL
                </button>
              </div>
              </div>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setChartDisplayMode('$')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded ${chartDisplayMode === '$' ? (darkMode ? 'bg-[#00d28a] text-black' : 'bg-black text-white') : (darkMode ? 'border border-[#00d28a] text-white' : 'border border-black text-black')}`}
                >
                  $
                </button>
                <button
                  onClick={() => setChartDisplayMode('%')}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold rounded ${chartDisplayMode === '%' ? (darkMode ? 'bg-[#00d28a] text-black' : 'bg-black text-white') : (darkMode ? 'border border-[#00d28a] text-white' : 'border border-black text-black')}`}
                >
                  %
                </button>
              </div>
            </div>
            <div className="h-[300px] sm:h-[400px] lg:h-[500px] w-full">
              {(() => {
                // Filter chart data based on timeframe
                const filteredChartData = (() => {
                  if (chartTimeframe === 'ALL') {
                    // Even in ALL mode, limit to last 100 points to keep chart readable
                    // 100 points = ~8.3 minutes of data (1 point every 5 seconds)
                    return chartData.slice(-100);
                  }

                  const timeframeMinutes = chartTimeframe === '15M' ? 15 : chartTimeframe === '1H' ? 60 : 240;

                  // Since we don't have timestamps, use last N points (approximate)
                  const pointsPerMinute = 12; // 1 point every 5 seconds = 12 points per minute
                  const pointsToShow = Math.ceil(timeframeMinutes * pointsPerMinute);

                  return chartData.slice(-pointsToShow);
                })();

                return (
              <ResponsiveContainer width="100%" height="100%" debounce={300}>
                <LineChart data={filteredChartData} margin={{ top: 5, right: 150, left: 5, bottom: 5 }}>
                <defs>
                  {aiTraders.map(trader => (
                    <linearGradient key={`gradient-${trader.name}`} id={`gradient-${trader.name}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={trader.color} stopOpacity={0.3}/>
                      <stop offset="100%" stopColor={trader.color} stopOpacity={0}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(0, 210, 138, 0.1)' : '#e0e0e0'} />
                <XAxis
                  dataKey="time"
                  stroke={darkMode ? '#00d28a' : '#666666'}
                  tick={{ fill: darkMode ? '#00d28a' : '#666666', fontSize: 11 }}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis
                  stroke={darkMode ? '#00d28a' : '#666666'}
                  domain={chartDisplayMode === '$' ? ['dataMin - 20', 'dataMax + 20'] : [0, 'auto']}
                  tick={{ fill: darkMode ? '#00d28a' : '#666666', fontSize: 11 }}
                  tickFormatter={(value) => {
                    if (chartDisplayMode === '$') {
                      return `$${value.toFixed(0)}`;
                    } else {
                      // Calculate percentage from initial balance of 200
                      const percent = ((value - 200) / 200) * 100;
                      return `${percent >= 0 ? '+' : ''}${percent.toFixed(0)}%`;
                    }
                  }}
                />
                <ReferenceLine
                  y={chartDisplayMode === '$' ? 200 : 0}
                  stroke={darkMode ? '#00d28a' : '#999999'}
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{ value: chartDisplayMode === '$' ? '$200 (Initial Balance)' : '0% (Initial Balance)', position: 'right', fill: darkMode ? '#00d28a' : '#666666' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                {aiTraders
                  .filter(trader => !selectedChartTrader || trader.name === selectedChartTrader)
                  .map((trader) => (
                  <Line
                    key={trader.name}
                    type="monotone"
                    dataKey={trader.name}
                    stroke={trader.color}
                    strokeWidth={hoveredTrader === trader.name ? 5 : 3}
                    strokeOpacity={hoveredTrader && hoveredTrader !== trader.name ? 0.15 : 1}
                    dot={(props) => <CustomDot {...props} aiTraders={aiTraders} chartData={filteredChartData} onClick={setSelectedChartTrader} />}
                    activeDot={{
                      r: 8,
                      cursor: 'pointer',
                      onClick: () => setSelectedChartTrader(trader.name),
                      onMouseEnter: () => setHoveredTrader(trader.name),
                      onMouseLeave: () => setHoveredTrader(null),
                      fill: trader.color,
                      stroke: trader.color,
                      strokeWidth: 2
                    }}
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  />
                ))}
              </LineChart>
              </ResponsiveContainer>
                );
              })()}
            </div>
          </div>

          {/* Live Feed and AI Traders - 1 column on the right, full width on mobile */}
          <div className="space-y-2 sm:space-y-4">
            {/* Live Feed with Tabs */}
            <div className={`rounded-lg p-2 sm:p-3 ${darkMode ? 'glass' : 'glass-light border border-gray-300'}`}>
              {/* Tabs Header */}
              <div className="flex items-center gap-2 sm:gap-4 mb-2 border-b pb-2 overflow-x-auto" style={{ borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <button
                  onClick={() => setLiveFeedTab('feed')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    liveFeedTab === 'feed'
                      ? (darkMode ? 'bg-[#4dffa1]/20 text-[#4dffa1]' : 'bg-[#4dffa1]/20 text-[#00d28a]')
                      : (darkMode ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                  }`}
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  LIVE FEED
                </button>
                <button
                  onClick={() => setLiveFeedTab('about')}
                  className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    liveFeedTab === 'about'
                      ? (darkMode ? 'bg-[#4dffa1]/20 text-[#4dffa1]' : 'bg-[#4dffa1]/20 text-[#00d28a]')
                      : (darkMode ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                  }`}
                >
                  ABOUT AION
                </button>
                {liveFeedTab === 'feed' && (
                  <select
                    value={selectedTraderFilter}
                    onChange={(e) => setSelectedTraderFilter(e.target.value)}
                    className={`ml-auto text-[10px] sm:text-xs px-1.5 sm:px-2 py-1 rounded ${darkMode ? 'bg-white/10 text-white border border-white/20' : 'bg-gray-100 text-gray-900 border border-gray-300'}`}
                    style={{
                      colorScheme: darkMode ? 'dark' : 'light'
                    }}
                  >
                    <option value="ALL" style={{ backgroundColor: darkMode ? '#1a1a1a' : '#ffffff', color: darkMode ? '#ffffff' : '#000000' }}>ALL</option>
                    {aiTraders.map(trader => (
                      <option key={trader.name} value={trader.name} style={{ backgroundColor: darkMode ? '#1a1a1a' : '#ffffff', color: darkMode ? '#ffffff' : '#000000' }}>{trader.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Tab Content */}
              {liveFeedTab === 'feed' ? (
                <div className="space-y-2 h-[200px] sm:h-[220px] overflow-y-auto pr-2">
              {messages.filter(msg => selectedTraderFilter === 'ALL' || msg.trader === selectedTraderFilter).map((msg, idx) => {
                const trader = aiTraders.find(t => t.name === msg.trader);
                const badgeColor = trader ? trader.color : '#00d28a';
                return (
                  <div key={idx} className={`rounded p-2 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-[11px] font-bold px-2 py-1 rounded text-white"
                        style={{ backgroundColor: badgeColor, willChange: 'background-color' }}
                      >
                        {msg.trader}
                      </span>
                      <span className={`text-[10px] ml-auto ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>{msg.timestamp}</span>
                    </div>
                    <div className={`text-sm leading-relaxed ${darkMode ? 'text-white/80' : 'text-gray-700'}`} dangerouslySetInnerHTML={{ __html: msg.message }}></div>
                  </div>
                );
              })}
              {messages.filter(msg => selectedTraderFilter === 'ALL' || msg.trader === selectedTraderFilter).length === 0 && (
                <div className={`text-center py-12 border border-dashed rounded-lg ${darkMode ? 'border-white/20' : 'border-gray-300'}`}>
                  <Activity size={24} className={`mx-auto mb-2 animate-pulse ${darkMode ? 'text-white/40' : 'text-gray-400'}`} />
                  <p className={`text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>WAITING FOR ACTIVITY...</p>
                </div>
              )}
                </div>
              ) : (
                <div className="h-[200px] sm:h-[220px] overflow-y-auto pr-2">
                  <div className={`space-y-3 sm:space-y-4 ${darkMode ? 'text-white/80' : 'text-gray-700'}`}>
                    <div>
                      <h3 className={`text-lg sm:text-xl font-bold mb-2 ${darkMode ? 'text-[#4dffa1]' : 'text-[#00d28a]'}`}>Welcome to AION</h3>
                      <p className="leading-relaxed text-xs sm:text-sm">
                        AION (Autonomous Intelligence Operating Network) is a cutting-edge AI trading platform that leverages the power of multiple artificial intelligence models to execute autonomous trading strategies on-chain.
                      </p>
                    </div>

                    <div>
                      <h4 className={`text-base sm:text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Our AI Traders</h4>
                      <p className="leading-relaxed text-xs sm:text-sm mb-2">
                        AION employs five distinct AI models, each with unique algorithmic approaches:
                      </p>
                      <ul className="space-y-1 text-xs sm:text-sm ml-4">
                        <li><span className="text-[#000000] font-bold">• GROK</span> - Momentum Trading</li>
                        <li><span className="text-[#f47855] font-bold">• CLAUDE</span> - Mean Reversion</li>
                        <li><span className="text-[#009a57] font-bold">• CHATGPT</span> - Trend Following</li>
                        <li><span className="text-[#396bff] font-bold">• DEEPSEEK</span> - Statistical Arbitrage</li>
                        <li><span className="text-[#9068c1] font-bold">• GEMINI</span> - Breakout Trading</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className={`text-base sm:text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>How It Works</h4>
                      <p className="leading-relaxed text-xs sm:text-sm">
                        Operating 24/7 on the Aster perpetual futures exchange, our system analyzes real-time market data, identifies profitable opportunities, and executes trades with precision and speed beyond human capability. With transparent performance tracking and risk management protocols, AION is pioneering the future of decentralized autonomous trading.
                      </p>
                    </div>

                    <div>
                      <h4 className={`text-base sm:text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Technology</h4>
                      <p className="leading-relaxed text-xs sm:text-sm">
                        Each AI trader starts with an initial balance of $200 and operates independently, making decisions based on market conditions, technical indicators, and learned patterns. Performance metrics including win rate, total trades, and P&L are tracked in real-time.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Traders */}
            <div className={`rounded-lg p-2 sm:p-3 ${darkMode ? 'glass' : 'glass-light border border-gray-300'}`}>
              <h2 className={`text-base sm:text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>AION TRADERS - AI</h2>
              <div className="space-y-2 h-[200px] sm:h-[220px] lg:h-[250px] overflow-y-auto pr-2">
              {[...aiTraders].sort((a, b) => b.balance - a.balance).map((trader, idx) => (
                <div key={trader.name} className={`rounded-lg p-3 sm:p-4 ${darkMode ? 'bg-white/5 border border-white/10' : 'border border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className={`text-base sm:text-lg font-bold ${darkMode ? 'text-white/40' : 'text-gray-400'}`}>#{idx + 1}</span>
                      <div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: trader.color }}></div>
                          <span className={`text-sm sm:text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{trader.name}</span>
                        </div>
                        <div className={`text-[10px] sm:text-xs ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>{trader.strategy}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-base sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${trader.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-[10px] sm:text-xs font-bold ${trader.totalPnL >= 0 ? 'text-[#00ff41]' : 'text-red-500'}`}>
                        {trader.totalPnL >= 0 ? '+' : ''}{((trader.totalPnL / 200) * 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                      </div>
                    </div>
                  </div>
                  <div className={`grid grid-cols-3 gap-1 sm:gap-2 text-[10px] sm:text-xs pt-2 border-t ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
                    <div><span className={darkMode ? 'text-white/60' : 'text-gray-500'}>STATUS:</span> <span className={darkMode ? 'text-white' : 'text-gray-900'}>{trader.status.toUpperCase()}</span></div>
                    <div><span className={darkMode ? 'text-white/60' : 'text-gray-500'}>WIN:</span> <span className={trader.winRate >= 50 ? 'text-[#00ff41] font-bold' : 'text-red-500 font-bold'}>{trader.winRate.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</span></div>
                    <div><span className={darkMode ? 'text-white/60' : 'text-gray-500'}>TRADES:</span> <span className={darkMode ? 'text-white' : 'text-gray-900'}>{trader.trades}</span></div>
                  </div>
                </div>
              ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`rounded-lg p-4 sm:p-6 text-center fade-in ${darkMode ? 'glass' : 'glass-light border border-gray-300'}`}>
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-3 sm:mb-4">
            <a
              href="https://x.com/aion_autonomous?s=21"
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-colors ${darkMode ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-[#00d28a]'}`}
            >
              <X size={28} className="sm:w-8 sm:h-8" />
            </a>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#00d28a] rounded-full animate-pulse"></div>
              <p className={`text-xs sm:text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Online with Aster</p>
            </div>
            <span className={`text-xs sm:text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>•</span>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>AUTOMATED AI TRADING SYSTEM • 24/7 MONITORING • RISK MANAGED</p>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
};

export default App;
