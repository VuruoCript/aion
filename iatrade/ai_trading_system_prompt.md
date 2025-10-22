# Prompt: Sistema Completo de Trading Automatizado com Múltiplas IAs

## Objetivo
Desenvolver um sistema full-stack onde múltiplas IAs (Grok, Claude, ChatGPT, DeepSeek, Gemini) negociam criptomoedas de forma autônoma na exchange Hyperliquid, com interface web em tempo real mostrando performance, decisões e comunicação entre as IAs.

---

## Arquitetura do Sistema

### 1. FRONTEND (React + Tailwind CSS)
Criar uma single-page application (SPA) com:

**Componentes principais:**
- **Dashboard Overview**
  - Saldo total do portfólio
  - P&L (Profit and Loss) em USD e percentual
  - Tempo de operação
  - Número de trades executados
  
- **Gráfico de Performance em Tempo Real**
  - Line chart com Recharts mostrando saldo de cada IA
  - Eixo X: tempo
  - Eixo Y: saldo em USD
  - 5 linhas coloridas (uma para cada IA)
  - Atualização via WebSocket a cada 2-5 segundos

- **Painel de Status das IAs**
  - Cards individuais para cada IA mostrando:
    - Nome e cor identificadora
    - Saldo atual
    - P&L individual
    - Win rate (% de trades lucrativos)
    - Estratégia sendo usada
    - Status atual (analyzing, trading, waiting)
    - Última ação executada
  - Ranking dinâmico por performance

- **Feed de Trading ao Vivo**
  - Lista scrollable de mensagens
  - Cada mensagem deve conter:
    - Nome da IA
    - Timestamp
    - Descrição da decisão/estratégia
    - Par negociado
    - Tipo de operação (LONG/SHORT/CLOSE)
    - Raciocínio da IA
  - Auto-scroll para novas mensagens
  - Limite de 100 mensagens visíveis

**Requisitos técnicos:**
- Usar React com hooks (useState, useEffect)
- WebSocket client para receber updates em tempo real
- Responsivo (desktop e mobile)
- Design dark mode (fundo preto, texto branco/cinza)
- Animações suaves nas transições

---

### 2. BACKEND (Node.js + Express + TypeScript)

#### 2.1 Estrutura do Servidor

```
backend/
├── src/
│   ├── server.ts              # Entry point
│   ├── config/
│   │   ├── llm.config.ts      # Configurações das APIs de LLM
│   │   └── hyperliquid.config.ts
│   ├── services/
│   │   ├── LLMService.ts      # Abstração para múltiplas LLMs
│   │   ├── HyperliquidService.ts
│   │   ├── TradingEngine.ts
│   │   └── WebSocketService.ts
│   ├── models/
│   │   ├── AITrader.ts
│   │   └── Trade.ts
│   ├── controllers/
│   │   └── TradingController.ts
│   └── utils/
│       ├── marketData.ts
│       └── logger.ts
└── package.json
```

#### 2.2 Serviço de LLM (LLMService.ts)

Criar uma classe abstrata que integre com múltiplas APIs:

**Funcionalidades:**
- Método para cada provedor (OpenAI, Anthropic, xAI, DeepSeek, Gemini)
- Sistema de retry com exponential backoff
- Rate limiting por provedor
- Timeout de 30 segundos por requisição
- Logging de todas as decisões

**Cada IA deve receber como input:**
```typescript
interface TradingContext {
  currentBalance: number;
  openPositions: Position[];
  marketData: {
    symbol: string;
    price: number;
    volume24h: number;
    priceChange24h: number;
    orderbook: OrderBook;
  }[];
  recentTrades: Trade[];
  accountHistory: {
    totalPnL: number;
    winRate: number;
    bestTrade: Trade;
    worstTrade: Trade;
  };
  timestamp: number;
}
```

**Cada IA deve retornar:**
```typescript
interface TradingDecision {
  action: 'OPEN_LONG' | 'OPEN_SHORT' | 'CLOSE_POSITION' | 'HOLD';
  symbol: string;
  size?: number;        // Quantidade em USD
  leverage?: number;    // 1x a 50x
  stopLoss?: number;    // Preço de stop loss
  takeProfit?: number;  // Preço de take profit
  reasoning: string;    // Explicação da decisão (mínimo 100 caracteres)
  strategy: string;     // Nome da estratégia usada
  confidence: number;   // 0 a 100
}
```

**Prompt base para cada IA:**
```
Você é um trader profissional de criptomoedas operando na exchange Hyperliquid no mercado de futuros.

CAPITAL DISPONÍVEL: ${balance} USD
POSIÇÕES ABERTAS: ${openPositions}

DADOS DE MERCADO ATUAL:
${marketData}

HISTÓRICO DE PERFORMANCE:
- Win Rate: ${winRate}%
- P&L Total: ${totalPnL} USD
- Número de trades: ${tradeCount}

SUA MISSÃO:
1. Analisar os dados de mercado fornecidos
2. Identificar oportunidades de trading
3. Decidir se deve abrir LONG, SHORT, fechar posições ou aguardar (HOLD)
4. Aplicar gestão de risco apropriada (stop loss, tamanho de posição, leverage)
5. Explicar seu raciocínio de forma clara

REGRAS OBRIGATÓRIAS:
- Nunca arriscar mais de 10% do capital em um único trade
- Sempre definir stop loss
- Máximo de 3 posições abertas simultaneamente
- Leverage máximo: 10x (recomendado: 2-5x)
- Considerar volatilidade antes de entrar em posições

INSTRUÇÕES:
Retorne sua decisão em formato JSON válido seguindo exatamente esta estrutura:
{
  "action": "OPEN_LONG" | "OPEN_SHORT" | "CLOSE_POSITION" | "HOLD",
  "symbol": "BTC-USD" | "ETH-USD" | "SOL-USD" | etc,
  "size": <valor em USD>,
  "leverage": <1 a 10>,
  "stopLoss": <preço>,
  "takeProfit": <preço>,
  "reasoning": "<explicação detalhada da sua decisão, incluindo indicadores técnicos analisados, padrões identificados e justificativa da gestão de risco>",
  "strategy": "<nome da estratégia: Momentum, Mean Reversion, Breakout, etc>",
  "confidence": <0 a 100>
}

Seja preciso, objetivo e sempre priorize preservação de capital.
```

#### 2.3 Integração Hyperliquid (HyperliquidService.ts)

**Documentação oficial:** https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api

**Funcionalidades necessárias:**

1. **Autenticação**
   - Gerar assinatura HMAC para requisições
   - Gerenciar API keys de forma segura (variáveis de ambiente)

2. **Obter dados de mercado**
   ```typescript
   async getMarketData(symbol: string): Promise<MarketData>
   async getOrderbook(symbol: string, depth: number): Promise<OrderBook>
   async get24hStats(symbol: string): Promise<Stats24h>
   ```

3. **Executar ordens**
   ```typescript
   async placeOrder(params: {
     symbol: string;
     side: 'BUY' | 'SELL';
     type: 'MARKET' | 'LIMIT';
     size: number;
     leverage: number;
     reduceOnly?: boolean;
   }): Promise<Order>
   ```

4. **Gerenciar posições**
   ```typescript
   async getPositions(): Promise<Position[]>
   async closePosition(symbol: string): Promise<boolean>
   async setStopLoss(symbol: string, price: number): Promise<boolean>
   async setTakeProfit(symbol: string, price: number): Promise<boolean>
   ```

5. **Account info**
   ```typescript
   async getAccountBalance(): Promise<AccountBalance>
   async getTradeHistory(limit: number): Promise<Trade[]>
   ```

**Endpoints Hyperliquid principais:**
- REST API: `https://api.hyperliquid.xyz`
- WebSocket: `wss://api.hyperliquid.xyz/ws`

**Tratamento de erros:**
- Retry automático em caso de erro de rede (máximo 3 tentativas)
- Log detalhado de todos os erros
- Notificação via WebSocket para frontend em caso de falha crítica

#### 2.4 Trading Engine (TradingEngine.ts)

Motor principal que coordena tudo:

**Fluxo de execução:**

```typescript
class TradingEngine {
  private aiTraders: AITrader[];
  private hyperliquidService: HyperliquidService;
  private llmService: LLMService;
  private wsService: WebSocketService;
  
  async start() {
    // 1. Inicializar cada IA com capital inicial ($200)
    // 2. Loop infinito:
    while (true) {
      for (const trader of this.aiTraders) {
        try {
          // A. Coletar dados de mercado
          const marketData = await this.getMarketContext(trader);
          
          // B. Consultar IA para decisão
          const decision = await this.llmService.getDecision(
            trader.name, 
            marketData
          );
          
          // C. Validar decisão (regras de risco)
          const validated = this.validateDecision(decision, trader);
          
          // D. Executar trade na Hyperliquid
          if (validated.action !== 'HOLD') {
            const result = await this.executeTrade(validated, trader);
            
            // E. Atualizar estado do trader
            trader.updateBalance(result);
            trader.addTrade(result);
          }
          
          // F. Enviar update para frontend via WebSocket
          this.wsService.broadcast({
            type: 'TRADER_UPDATE',
            trader: trader.toJSON(),
            decision: decision,
            timestamp: Date.now()
          });
          
          // G. Adicionar mensagem ao feed
          this.wsService.broadcast({
            type: 'TRADE_MESSAGE',
            trader: trader.name,
            message: decision.reasoning,
            action: decision.action,
            symbol: decision.symbol,
            timestamp: Date.now()
          });
          
        } catch (error) {
          console.error(`Error with ${trader.name}:`, error);
          // Continuar com próxima IA
        }
      }
      
      // H. Aguardar intervalo antes do próximo ciclo (30-60 segundos)
      await this.sleep(45000);
    }
  }
  
  private validateDecision(decision: TradingDecision, trader: AITrader): TradingDecision {
    // Validações de segurança:
    // - Size não excede 10% do capital
    // - Leverage não excede 10x
    // - Stop loss está definido
    // - Trader não tem mais de 3 posições abertas
    // - Capital suficiente para o trade
  }
}
```

#### 2.5 WebSocket Service (WebSocketService.ts)

**Funcionalidades:**
- Servidor WebSocket para comunicação em tempo real
- Broadcast de updates para todos os clientes conectados
- Heartbeat para manter conexões ativas
- Reconexão automática no cliente

**Eventos enviados ao frontend:**
```typescript
type WSMessage = 
  | { type: 'TRADER_UPDATE', trader: AITrader, timestamp: number }
  | { type: 'TRADE_MESSAGE', trader: string, message: string, timestamp: number }
  | { type: 'CHART_UPDATE', data: ChartDataPoint[], timestamp: number }
  | { type: 'ERROR', error: string, trader?: string }
  | { type: 'SYSTEM', message: string };
```

#### 2.6 Gestão de Risco (implementada nas IAs + validação backend)

**Regras hard-coded no backend (não negociáveis):**
1. Máximo 10% do capital por trade
2. Máximo 3 posições simultâneas por IA
3. Leverage limitado a 10x (recomendado 2-5x)
4. Stop loss obrigatório em todas as posições
5. Se saldo cair abaixo de $50, IA entra em modo "recuperação" (só trades conservadores)

**Regras que as IAs devem seguir (via prompt):**
- Analisar volatilidade antes de entrar
- Considerar correlação entre posições abertas
- Ajustar tamanho de posição baseado em confiança
- Usar trailing stop em trades lucrativos
- Não aumentar posição perdedora (no averaging down)
- Respeitar win rate e ajustar estratégia se necessário

---

### 3. BANCO DE DADOS (PostgreSQL ou MongoDB)

**Schema necessário:**

```sql
-- Tabela de Traders
CREATE TABLE ai_traders (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  initial_balance DECIMAL(10,2) NOT NULL,
  current_balance DECIMAL(10,2) NOT NULL,
  total_pnl DECIMAL(10,2) DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0,
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  strategy VARCHAR(100),
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Trades
CREATE TABLE trades (
  id SERIAL PRIMARY KEY,
  trader_id INTEGER REFERENCES ai_traders(id),
  symbol VARCHAR(20) NOT NULL,
  side VARCHAR(10) NOT NULL,
  entry_price DECIMAL(20,8) NOT NULL,
  exit_price DECIMAL(20,8),
  size DECIMAL(20,8) NOT NULL,
  leverage INTEGER NOT NULL,
  stop_loss DECIMAL(20,8),
  take_profit DECIMAL(20,8),
  pnl DECIMAL(10,2),
  status VARCHAR(20) NOT NULL,
  reasoning TEXT,
  opened_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  confidence INTEGER
);

-- Tabela de Mensagens (Feed)
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  trader_id INTEGER REFERENCES ai_traders(id),
  message TEXT NOT NULL,
  trade_id INTEGER REFERENCES trades(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Performance Histórica
CREATE TABLE performance_history (
  id SERIAL PRIMARY KEY,
  trader_id INTEGER REFERENCES ai_traders(id),
  balance DECIMAL(10,2) NOT NULL,
  pnl DECIMAL(10,2) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
);
```

---

### 4. VARIÁVEIS DE AMBIENTE (.env)

```bash
# Server
PORT=3001
NODE_ENV=production

# Hyperliquid API
HYPERLIQUID_API_KEY=your_api_key_here
HYPERLIQUID_API_SECRET=your_api_secret_here
HYPERLIQUID_API_URL=https://api.hyperliquid.xyz

# LLM API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
XAI_API_KEY=xai-...
DEEPSEEK_API_KEY=sk-...
GOOGLE_API_KEY=...

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_trading

# WebSocket
WS_PORT=3002

# Trading Config
INITIAL_BALANCE_PER_AI=200
TRADING_INTERVAL_SECONDS=45
MAX_POSITIONS_PER_AI=3
MAX_LEVERAGE=10
MAX_RISK_PER_TRADE_PERCENT=10
```

---

### 5. CARACTERÍSTICAS ESPECÍFICAS DE CADA IA

Cada IA deve ter uma "personalidade" de trading distinta:

**1. Grok (xAI)**
- Estratégia: Momentum Trading
- Características: Agressivo, gosta de tendências fortes, usa média móvel e RSI
- Leverage preferido: 5-8x
- Timeframe: Curto prazo (scalping)

**2. Claude (Anthropic)**
- Estratégia: Mean Reversion
- Características: Conservador, busca reversões à média, analisa Bollinger Bands
- Leverage preferido: 2-3x
- Timeframe: Médio prazo (swing trading)

**3. ChatGPT (OpenAI)**
- Estratégia: Trend Following
- Características: Segue tendências estabelecidas, usa MACD e EMA
- Leverage preferido: 3-5x
- Timeframe: Médio prazo

**4. DeepSeek**
- Estratégia: Arbitrage / Statistical
- Características: Analítico, busca ineficiências, correlações entre pares
- Leverage preferido: 2-4x
- Timeframe: Variável

**5. Gemini (Google)**
- Estratégia: Breakout Trading
- Características: Aguarda rompimentos de suporte/resistência, usa volume
- Leverage preferido: 4-6x
- Timeframe: Curto a médio prazo

---

### 6. TESTES E SEGURANÇA

**Implementar:**
1. **Modo Paper Trading** (testnet da Hyperliquid) antes de usar capital real
2. **Kill switch**: Botão de emergência para parar todas as IAs
3. **Alertas**: Notificações se saldo cair X%
4. **Logs detalhados**: Todas as decisões e trades salvos
5. **Rate limiting**: Controlar chamadas às APIs de LLM
6. **Backup automático**: Estado do sistema a cada hora

---

### 7. DEPLOYMENT

**Recomendações:**
- **Backend**: VPS (DigitalOcean, AWS, Vultr) com Node.js
- **Frontend**: Vercel ou Netlify
- **Database**: PostgreSQL gerenciado (Supabase, Railway, Neon)
- **Monitoramento**: PM2 para manter processo rodando
- **Logs**: Winston + arquivo rotativo

---

### 8. CRONOGRAMA DE DESENVOLVIMENTO

**Fase 1 - Setup (2-3 dias)**
- Configurar ambiente de desenvolvimento
- Instalar dependências
- Criar estrutura de pastas
- Configurar TypeScript

**Fase 2 - Integração Hyperliquid (3-4 dias)**
- Implementar HyperliquidService
- Testar conexão e autenticação
- Testar execução de ordens em testnet
- Implementar gestão de posições

**Fase 3 - Integração LLMs (4-5 dias)**
- Implementar LLMService para cada provedor
- Criar e testar prompts
- Implementar sistema de retry e fallback
- Testar decisões de trading

**Fase 4 - Trading Engine (3-4 dias)**
- Implementar loop principal
- Integrar validação de risco
- Implementar logging
- Testar fluxo completo

**Fase 5 - WebSocket e Real-time (2-3 dias)**
- Implementar WebSocketService
- Testar comunicação em tempo real
- Implementar reconexão automática

**Fase 6 - Frontend (4-5 dias)**
- Criar componentes React
- Integrar Recharts
- Implementar WebSocket client
- Estilizar com Tailwind

**Fase 7 - Database e Persistência (2-3 dias)**
- Configurar PostgreSQL
- Implementar models e migrations
- Salvar histórico de trades
- Implementar queries para frontend

**Fase 8 - Testes e Refinamento (5-7 dias)**
- Testar em paper trading
- Ajustar prompts das IAs
- Otimizar performance
- Corrigir bugs

**Fase 9 - Deploy e Monitoramento (2-3 dias)**
- Deploy em produção
- Configurar monitoramento
- Testar em produção com capital mínimo
- Ajustes finais

**TOTAL ESTIMADO: 27-37 dias**

---

### 9. STACK TECNOLÓGICA COMPLETA

```json
{
  "frontend": {
    "framework": "React 18+",
    "language": "TypeScript",
    "styling": "Tailwind CSS",
    "charts": "Recharts",
    "icons": "Lucide React",
    "state": "React Hooks",
    "websocket": "native WebSocket API",
    "build": "Vite"
  },
  "backend": {
    "runtime": "Node.js 20+",
    "framework": "Express",
    "language": "TypeScript",
    "websocket": "ws library",
    "http": "axios",
    "crypto": "crypto (native)",
    "scheduler": "node-cron"
  },
  "database": {
    "primary": "PostgreSQL 15+",
    "orm": "Prisma ou TypeORM",
    "migrations": "Prisma Migrate"
  },
  "apis": {
    "trading": "Hyperliquid API",
    "llm": [
      "OpenAI GPT-4",
      "Anthropic Claude 3.5 Sonnet",
      "xAI Grok",
      "DeepSeek V2",
      "Google Gemini Pro"
    ]
  },
  "devops": {
    "process_manager": "PM2",
    "logging": "Winston",
    "monitoring": "Sentry (opcional)",
    "deployment": "Docker + Docker Compose"
  }
}
```

---

### 10. COMANDOS PARA INICIAR

```bash
# Backend
cd backend
npm install
npm run build
npm run start

# Frontend
cd frontend
npm install
npm run dev

# Com Docker
docker-compose up -d
```

---

### 11. CONSIDERAÇÕES FINAIS

**AVISOS IMPORTANTES:**
1. ⚠️ **Começar SEMPRE em testnet/paper trading**
2. ⚠️ **Nunca usar mais capital do que pode perder**
3. ⚠️ **Monitorar 24/7 nas primeiras semanas**
4. ⚠️ **Ter kill switch pronto**
5. ⚠️ **Manter logs de TUDO**

**PRÓXIMOS PASSOS:**
1. Criar conta na Hyperliquid e obter API keys
2. Obter API keys de todas as LLMs
3. Testar cada API individualmente
4. Implementar sistema em fases
5. Fazer backtesting extensivo antes de usar dinheiro real

**MELHORIAS FUTURAS:**
- Machine learning para otimizar estratégias
- Análise de sentimento de notícias/Twitter
- Multi-exchange (além de Hyperliquid)
- Dashboard de analytics mais avançado
- Sistema de votação entre IAs para decisões críticas
- Auto-ajuste de prompts baseado em performance

---

## ENTREGA ESPERADA

Um sistema completo e funcional onde:
1. ✅ 5 IAs diferentes fazem trading autônomo
2. ✅ Interface web mostra tudo em tempo real
3. ✅ Gráfico de performance atualizado constantemente
4. ✅ Feed de mensagens explicando decisões
5. ✅ Gestão de risco automática
6. ✅ Integração real com Hyperliquid
7. ✅ Persistência de dados
8. ✅ Sistema robusto e resiliente a erros

**BOA SORTE! 🚀💰**