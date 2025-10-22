import axios from 'axios';
import { llmConfig, LLMProvider } from '../config/llm.config.js';
import { TradingDecision } from '../models/AITrader.js';
import { TradingContext } from '../utils/marketData.js';
import logger from '../utils/logger.js';

export class LLMService {
  private createPrompt(context: TradingContext): string {
    return `You are a professional cryptocurrency trader operating on Hyperliquid futures exchange.

AVAILABLE CAPITAL: $${context.currentBalance.toFixed(2)} USD
OPEN POSITIONS: ${context.openPositions.length}

MARKET DATA:
${context.marketData.map(m => `${m.symbol}: $${m.price.toFixed(2)} | 24h Change: ${m.priceChange24h.toFixed(2)}% | Volume: $${(m.volume24h / 1000000).toFixed(2)}M`).join('\n')}

PERFORMANCE HISTORY:
- Win Rate: ${context.accountHistory.winRate.toFixed(1)}%
- Total P&L: $${context.accountHistory.totalPnL.toFixed(2)}
- Total Trades: ${context.accountHistory.totalTrades}

YOUR MISSION:
1. Analyze the provided market data
2. Identify trading opportunities
3. Decide whether to OPEN_LONG, OPEN_SHORT, CLOSE_POSITION, or HOLD
4. Apply appropriate risk management (stop loss, position size, leverage)
5. Explain your reasoning clearly

MANDATORY RULES:
- Never risk more than 10% of capital in a single trade
- Always set stop loss
- Maximum 3 positions open simultaneously
- Maximum leverage: 10x (recommended: 2-5x)
- Consider volatility before entering positions

INSTRUCTIONS:
Return your decision in valid JSON format following this exact structure:
{
  "action": "OPEN_LONG" | "OPEN_SHORT" | "CLOSE_POSITION" | "HOLD",
  "symbol": "BTC-USD" | "ETH-USD" | "SOL-USD" | etc,
  "size": <value in USD>,
  "leverage": <1 to 10>,
  "stopLoss": <price>,
  "takeProfit": <price>,
  "reasoning": "<detailed explanation of your decision, including technical indicators analyzed, patterns identified, and risk management justification>",
  "strategy": "<strategy name: Momentum, Mean Reversion, Breakout, etc>",
  "confidence": <0 to 100>
}

Be precise, objective, and always prioritize capital preservation.`;
  }

  async getDecision(
    provider: LLMProvider,
    context: TradingContext
  ): Promise<TradingDecision> {
    const config = llmConfig[provider];
    const prompt = this.createPrompt(context);

    try {
      let decision: TradingDecision;

      switch (provider) {
        case 'openai':
          decision = await this.getOpenAIDecision(prompt, config);
          break;
        case 'anthropic':
          decision = await this.getAnthropicDecision(prompt, config);
          break;
        case 'xai':
          decision = await this.getXAIDecision(prompt, config);
          break;
        case 'deepseek':
          decision = await this.getDeepSeekDecision(prompt, config);
          break;
        case 'google':
          decision = await this.getGoogleDecision(prompt, config);
          break;
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }

      logger.info(`${provider} decision: ${decision.action} ${decision.symbol || ''}`);
      return decision;
    } catch (error: any) {
      logger.error(`Error getting decision from ${provider}:`, error.message);
      // Return HOLD decision on error
      return {
        action: 'HOLD',
        symbol: '',
        reasoning: `Error communicating with ${provider}: ${error.message}`,
        strategy: 'ERROR_RECOVERY',
        confidence: 0
      };
    }
  }

  private async getOpenAIDecision(prompt: string, config: any): Promise<TradingDecision> {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: config.timeout
      }
    );

    const content = response.data.choices[0].message.content;
    return this.parseDecision(content);
  }

  private async getAnthropicDecision(prompt: string, config: any): Promise<TradingDecision> {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: config.model,
        max_tokens: config.maxTokens,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        timeout: config.timeout
      }
    );

    const content = response.data.content[0].text;
    return this.parseDecision(content);
  }

  private async getXAIDecision(prompt: string, config: any): Promise<TradingDecision> {
    // XAI/Grok API implementation (adjust endpoint when available)
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: config.timeout
      }
    );

    const content = response.data.choices[0].message.content;
    return this.parseDecision(content);
  }

  private async getDeepSeekDecision(prompt: string, config: any): Promise<TradingDecision> {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: config.timeout
      }
    );

    const content = response.data.choices[0].message.content;
    return this.parseDecision(content);
  }

  private async getGoogleDecision(prompt: string, config: any): Promise<TradingDecision> {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${config.model}:generateContent?key=${config.apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: config.temperature,
          maxOutputTokens: config.maxTokens
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: config.timeout
      }
    );

    const content = response.data.candidates[0].content.parts[0].text;
    return this.parseDecision(content);
  }

  private parseDecision(content: string): TradingDecision {
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ||
                       content.match(/(\{[\s\S]*\})/);

      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const decision = JSON.parse(jsonMatch[1]);

      // Validate required fields
      if (!decision.action || !decision.reasoning || !decision.strategy) {
        throw new Error('Missing required fields in decision');
      }

      return decision as TradingDecision;
    } catch (error: any) {
      logger.error('Error parsing LLM decision:', error.message);
      logger.debug('Raw content:', content);

      // Return safe HOLD decision
      return {
        action: 'HOLD',
        symbol: '',
        reasoning: 'Failed to parse LLM response',
        strategy: 'ERROR',
        confidence: 0
      };
    }
  }
}
