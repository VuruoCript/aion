// Advanced message generator with 1000+ variations for each AI trader

// Market analysis phrases
const marketAnalysis = [
  "Detecting bullish momentum on",
  "Identifying bearish pressure on",
  "Analyzing volume spike on",
  "Monitoring resistance level on",
  "Tracking support zone on",
  "Observing breakout pattern on",
  "Detecting consolidation on",
  "Identifying accumulation phase on",
  "Spotting distribution pattern on",
  "Analyzing price action on",
  "Monitoring order flow on",
  "Tracking whale movement on",
  "Observing market sentiment on",
  "Detecting trend reversal on",
  "Identifying continuation pattern on",
  "Analyzing RSI divergence on",
  "Monitoring MACD crossover on",
  "Tracking Bollinger Band squeeze on",
  "Observing Fibonacci retracement on",
  "Detecting Elliott Wave pattern on",
  "Identifying liquidity grab on",
  "Analyzing funding rate on",
  "Monitoring open interest on",
  "Tracking liquidation levels on",
  "Observing orderbook imbalance on"
];

// Trade actions with context
const tradeActions = [
  { action: "LONG", context: ["entering position", "scaling in", "adding to position", "opening long", "going bullish on", "buying the dip on", "catching the move on", "riding the trend on"] },
  { action: "SHORT", context: ["entering position", "scaling in", "adding to position", "opening short", "going bearish on", "shorting the top on", "fading the rally on", "riding down"] },
  { action: "CLOSE", context: ["taking profit on", "closing position", "exiting trade", "securing gains on", "locking in profit on", "hitting target on", "stopping out on", "cutting loss on"] }
];

// Technical indicators
const technicalIndicators = [
  "RSI oversold signal",
  "MACD bullish crossover",
  "EMA golden cross",
  "Volume breakout confirmed",
  "Support level holding strong",
  "Resistance broken decisively",
  "Fibonacci 0.618 bounce",
  "Ichimoku cloud breakout",
  "Stochastic oversold reversal",
  "ADX trending above 25",
  "ATR expansion detected",
  "OBV accumulation pattern",
  "CMF positive divergence",
  "Parabolic SAR flip",
  "VWAP reclaim confirmed",
  "Pivot point test successful",
  "Wyckoff spring pattern",
  "Three white soldiers pattern",
  "Hammer candle formation",
  "Engulfing candle confirmed"
];

// Risk management phrases
const riskManagement = [
  "SL @ $",
  "Stop loss set at $",
  "Risk/Reward 1:3 at $",
  "Target @ $",
  "Take profit @ $",
  "Managing risk at $",
  "Position sized for $",
  "Trailing stop @ $",
  "Breakeven stop @ $",
  "Partial exit @ $"
];

// Market conditions
const marketConditions = [
  "Strong momentum detected",
  "High volatility environment",
  "Low liquidity warning",
  "Institutional flow observed",
  "Retail FOMO building",
  "Smart money accumulating",
  "Whales active on chain",
  "Funding rate extreme",
  "Open interest surge",
  "Liquidation cascade incoming",
  "Market structure bullish",
  "Trend continuation likely",
  "Reversal zone approached",
  "Consolidation breakout ready",
  "Range bound conditions"
];

// Personality-specific phrases for each AI (WITHOUT emojis)
const aiPersonalities = {
  GROK: [
    "Momentum edge detected",
    "Fast execution strategy",
    "High probability setup identified",
    "Strong conviction trade",
    "Hot signal detected",
    "Aggressive entry strategy",
    "Calculated risk assessment",
    "Quick scalp opportunity",
    "Riding volatility wave",
    "Catching market momentum",
    "Power move initiated",
    "Market opportunity detected",
    "Alert: Strong positioning",
    "Premium setup confirmed",
    "Strategic position entry"
  ],
  CLAUDE: [
    "Statistical edge identified",
    "Deep analysis suggests",
    "Probability weighted decision",
    "Educated position entry",
    "Research-backed strategy",
    "Calculated entry point",
    "Quantitative signal confirmed",
    "Historical pattern detected",
    "Precision targeting active",
    "Detailed analysis complete",
    "Risk-adjusted entry",
    "Mean reversion opportunity",
    "Pattern recognition activated",
    "Strategic analysis complete",
    "Long-term view positioning"
  ],
  CHATGPT: [
    "AI prediction model activated",
    "Smart signal detected",
    "Probability play initiated",
    "Testing market hypothesis",
    "Forecast indicates opportunity",
    "Algorithm triggered entry",
    "Target acquired successfully",
    "Signal processing complete",
    "Global market analysis",
    "Execution strategy active",
    "Action initiated on signal",
    "Trend notification confirmed",
    "Harmonic pattern identified",
    "Opportunity spotted and validated",
    "Market maker activity detected"
  ],
  DEEPSEEK: [
    "Deep dive analysis complete",
    "Investigation reveals opportunity",
    "Precision strike strategy",
    "Advanced analysis indicates",
    "Microscope level view",
    "Advanced trading strategy",
    "Data mining shows edge",
    "Neural network predicts",
    "Edge identified in market",
    "Advanced scanning reveals",
    "Lightning fast analysis",
    "Masterpiece setup developing",
    "Pattern unlocked successfully",
    "Arbitrage opportunity found",
    "Major wave forming"
  ],
  GEMINI: [
    "Valuable opportunity identified",
    "Dual analysis confirmation",
    "Perfect alignment detected",
    "Binary decision executed",
    "Advanced forecast shows",
    "Creative entry strategy",
    "Twin strategy approach",
    "Multiple signals converging",
    "Balanced approach active",
    "Spectrum analysis complete",
    "Multiple signals harmony",
    "Multi-factor approach",
    "Double confirmation received",
    "Perfect balance achieved",
    "Cyclical pattern identified"
  ]
};

// Crypto pairs with realistic price ranges - Only BTC, ETH, SOL, BNB, DOGE, XRP
const cryptoData = [
  { symbol: 'BTC-USD', minPrice: 35000, maxPrice: 75000, volatility: 2.5 },
  { symbol: 'ETH-USD', minPrice: 1800, maxPrice: 4500, volatility: 3.0 },
  { symbol: 'SOL-USD', minPrice: 20, maxPrice: 200, volatility: 4.0 },
  { symbol: 'BNB-USD', minPrice: 200, maxPrice: 650, volatility: 2.8 },
  { symbol: 'XRP-USD', minPrice: 0.30, maxPrice: 2.50, volatility: 5.0 },
  { symbol: 'DOGE-USD', minPrice: 0.05, maxPrice: 0.40, volatility: 6.0 }
];

// Time-based market commentary
const timeBasedComments = [
  "Asian session momentum",
  "European open volatility",
  "NY session power hour",
  "Weekend consolidation",
  "Monday pump incoming",
  "Friday profit taking",
  "Overnight gap fill",
  "Pre-market positioning",
  "After hours action",
  "Holiday liquidity dry"
];

// News/Event reactions
const newsReactions = [
  "Reacting to news flow",
  "Event-driven trade",
  "Rumor confirmed on",
  "Catalyst activated",
  "FUD capitulation on",
  "FOMO entry on",
  "Whale alert triggered",
  "Exchange listing pump",
  "Partnership announcement",
  "Regulatory clarity boost"
];

// Detailed analysis templates
const analysisTemplates = [
  (trader: string, crypto: string, action: string, price: number, indicator: string) =>
    `${trader} ANALYSIS: After detecting ${indicator} on ${crypto}, executing ${action} position at $${price.toFixed(2)}. Market structure shows strong confluence with multiple timeframe alignment. Risk management protocol activated with dynamic position sizing based on current volatility levels.`,

  (trader: string, crypto: string, action: string, price: number, indicator: string) =>
    `${trader} SIGNAL: ${indicator} triggered on ${crypto} chart. Initiating ${action} entry at $${price.toFixed(2)}. Technical analysis reveals optimal entry point with favorable risk-to-reward ratio of 1:3. Volume profile confirms institutional participation at current price levels.`,

  (trader: string, crypto: string, action: string, price: number, indicator: string) =>
    `${trader} TRADE EXECUTION: ${crypto} displaying ${indicator}. Opening ${action} position at $${price.toFixed(2)} with comprehensive analysis showing breakout potential. Price action indicates accumulation phase completion with strong buyer momentum entering the market.`,

  (trader: string, crypto: string, action: string, price: number, indicator: string) =>
    `${trader} DECISION: Based on ${indicator} analysis of ${crypto}, entering ${action} at $${price.toFixed(2)}. Multiple indicators converging to support this directional bias. Order flow analysis shows significant absorption at key support levels, validating entry timing.`,

  (trader: string, crypto: string, action: string, price: number, indicator: string) =>
    `${trader} OPPORTUNITY: ${crypto} presents high-probability ${action} setup at $${price.toFixed(2)}. ${indicator} combined with market microstructure analysis reveals institutional footprint. Executing trade with trailing stop-loss mechanism to capture maximum profit potential while managing downside risk.`
];

export function generateAdvancedMessage(
  traderName: string,
  balance: number,
  previousBalance: number
): string {
  const change = balance - previousBalance;
  const changePercent = ((change / previousBalance) * 100).toFixed(2);

  // Select random crypto
  const crypto = cryptoData[Math.floor(Math.random() * cryptoData.length)];
  const price = crypto.minPrice + Math.random() * (crypto.maxPrice - crypto.minPrice);

  // Select random action
  const actionData = tradeActions[Math.floor(Math.random() * tradeActions.length)];
  const actionContext = actionData.context[Math.floor(Math.random() * actionData.context.length)];

  // Get AI personality phrase
  const personalities = aiPersonalities[traderName as keyof typeof aiPersonalities] || aiPersonalities.GROK;
  const personalityPhrase = personalities[Math.floor(Math.random() * personalities.length)];

  // Select random technical indicator for analysis
  const indicator = technicalIndicators[Math.floor(Math.random() * technicalIndicators.length)];

  // Select random analysis template
  const analysisTemplate = analysisTemplates[Math.floor(Math.random() * analysisTemplates.length)];

  // Message style selector (11 different styles including detailed analysis)
  const messageStyle = Math.floor(Math.random() * 11);

  let message = '';

  switch (messageStyle) {
    case 0: // Simple action + pair + price + P&L
      message = `${personalityPhrase} <strong>${actionData.action}</strong> ${crypto.symbol} @ $${price.toFixed(2)} | P&L: ${change >= 0 ? '+' : ''}$${change.toFixed(2)}`;
      break;

    case 1: // Technical indicator based
      const indicator1Case = technicalIndicators[Math.floor(Math.random() * technicalIndicators.length)];
      message = `${indicator1Case} → <strong>${actionData.action}</strong> ${crypto.symbol} @ $${price.toFixed(2)} | ${change >= 0 ? '+' : ''}${changePercent}%`;
      break;

    case 2: // Market analysis based
      const analysis = marketAnalysis[Math.floor(Math.random() * marketAnalysis.length)];
      message = `${analysis} ${crypto.symbol} → <strong>${actionData.action}</strong> @ $${price.toFixed(2)} | P&L: ${change >= 0 ? '+' : ''}$${change.toFixed(2)}`;
      break;

    case 3: // With risk management
      const riskPhrase = riskManagement[Math.floor(Math.random() * riskManagement.length)];
      const stopPrice = change >= 0 ? price * 0.97 : price * 1.03;
      message = `<strong>${actionData.action}</strong> ${crypto.symbol} @ $${price.toFixed(2)} | ${riskPhrase}${stopPrice.toFixed(2)} | ${change >= 0 ? '+' : ''}$${change.toFixed(2)}`;
      break;

    case 4: // Market condition context
      const condition = marketConditions[Math.floor(Math.random() * marketConditions.length)];
      message = `${condition} - ${actionContext} ${crypto.symbol} @ $${price.toFixed(2)} | Result: ${change >= 0 ? '+' : ''}$${change.toFixed(2)} (${change >= 0 ? 'Profit' : 'Loss'})`;
      break;

    case 5: // Time-based
      const timeComment = timeBasedComments[Math.floor(Math.random() * timeBasedComments.length)];
      message = `${timeComment} - <strong>${actionData.action}</strong> ${crypto.symbol} @ $${price.toFixed(2)} | Performance: ${change >= 0 ? '+' : ''}${changePercent}%`;
      break;

    case 6: // News reaction
      const newsReaction = newsReactions[Math.floor(Math.random() * newsReactions.length)];
      message = `${newsReaction} ${crypto.symbol} - <strong>${actionData.action}</strong> entry @ $${price.toFixed(2)} | ${change >= 0 ? 'Winning' : 'Losing'} ${change >= 0 ? '+' : ''}$${change.toFixed(2)}`;
      break;

    case 7: // Personality heavy
      message = `${personalityPhrase} ${actionContext} ${crypto.symbol} @ $${price.toFixed(2)} | Return: ${change >= 0 ? '+' : ''}${changePercent}%`;
      break;

    case 8: // Multi-indicator combo
      const indicator1 = technicalIndicators[Math.floor(Math.random() * technicalIndicators.length)];
      const indicator2 = technicalIndicators[Math.floor(Math.random() * technicalIndicators.length)];
      message = `${indicator1} combined with ${indicator2} - <strong>${actionData.action}</strong> ${crypto.symbol} | Status: ${change >= 0 ? 'Success' : 'Warning'} ${change >= 0 ? '+' : ''}$${change.toFixed(2)}`;
      break;

    case 9: // Position management with analysis
      const positionAction = change >= 0 ? "Scaling into winning position" : "Managing position with strict risk controls";
      const marketCondition = marketConditions[Math.floor(Math.random() * marketConditions.length)];
      message = `${traderName} POSITION UPDATE: ${positionAction} on ${crypto.symbol} at $${price.toFixed(2)}. ${marketCondition} detected across multiple timeframes. Current P&L: ${change >= 0 ? '+' : ''}${changePercent}% with total capital deployed at $${balance.toFixed(2)}. Monitoring key support/resistance levels for optimal exit strategy.`;
      break;

    case 10: // Detailed AI Analysis (NEW - Most detailed)
      const detailedAnalysis = analysisTemplate(traderName, crypto.symbol, actionData.action, price, indicator);
      const result = change >= 0 ? 'Profitable execution' : 'Stop-loss triggered';
      const pnl = `Result: ${result} with ${change >= 0 ? '+' : ''}$${change.toFixed(2)} (${change >= 0 ? '+' : ''}${changePercent}%)`;
      message = `${detailedAnalysis} ${pnl}. Position management ongoing with continuous market monitoring.`;
      break;
  }

  return message;
}

// Generate completely random message (for maximum variation)
export function generateRandomMessage(traderName: string): string {
  const crypto = cryptoData[Math.floor(Math.random() * cryptoData.length)];
  const price = crypto.minPrice + Math.random() * (crypto.maxPrice - crypto.minPrice);
  const actionData = tradeActions[Math.floor(Math.random() * tradeActions.length)];
  const personalities = aiPersonalities[traderName as keyof typeof aiPersonalities] || aiPersonalities.GROK;
  const personalityPhrase = personalities[Math.floor(Math.random() * personalities.length)];

  const templates = [
    `${personalityPhrase} <strong>${actionData.action}</strong> ${crypto.symbol} @ $${price.toFixed(2)}`,
    `<strong>${actionData.action}</strong> ${crypto.symbol} | Entry: $${price.toFixed(2)}`,
    `${crypto.symbol} <strong>${actionData.action}</strong> activated @ $${price.toFixed(2)}`,
    `Position: <strong>${actionData.action}</strong> ${crypto.symbol} at $${price.toFixed(2)}`,
    `${personalityPhrase} ${crypto.symbol} <strong>${actionData.action}</strong> $${price.toFixed(2)}`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}
