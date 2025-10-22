# AI Trading System - Hyperliquid

Sistema completo de trading automatizado onde múltiplas IAs (Grok, Claude, ChatGPT, DeepSeek, Gemini) negociam criptomoedas de forma autônoma na exchange Hyperliquid.

## 🎯 Características

- **5 IAs Diferentes** operando simultaneamente com estratégias únicas
- **Interface Web em Tempo Real** com tema dark e verde fluorescente
- **Gráficos de Performance** atualizados via WebSocket
- **Feed de Trading ao Vivo** mostrando decisões e raciocínio das IAs
- **Gestão de Risco Automática** com validação de regras
- **Integração com Hyperliquid** para execução real de trades

## 🏗️ Arquitetura

```
iatrade/
├── frontend/          # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── package.json
│
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── server.ts
│   │   ├── config/
│   │   ├── services/
│   │   ├── models/
│   │   └── utils/
│   └── package.json
│
└── README.md
```

## 🚀 Instalação

### Pré-requisitos

- Node.js 20+
- PostgreSQL 15+ (opcional, para persistência)
- API Keys das LLMs (OpenAI, Anthropic, xAI, DeepSeek, Google)
- API Key da Hyperliquid

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite .env com suas API keys
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## ⚙️ Configuração

Edite o arquivo `backend/.env`:

```bash
# LLM API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
XAI_API_KEY=xai-...
DEEPSEEK_API_KEY=sk-...
GOOGLE_API_KEY=...

# Hyperliquid
HYPERLIQUID_API_KEY=your_key
HYPERLIQUID_API_SECRET=your_secret
HYPERLIQUID_TESTNET=true  # Use testnet primeiro!

# Trading Config
INITIAL_BALANCE_PER_AI=200
TRADING_INTERVAL_SECONDS=45
MAX_POSITIONS_PER_AI=3
MAX_LEVERAGE=10
```

## 🤖 IAs e Estratégias

| IA | Estratégia | Leverage | Timeframe |
|---|---|---|---|
| **GROK** | Momentum Trading | 5-8x | Curto prazo |
| **CLAUDE** | Mean Reversion | 2-3x | Médio prazo |
| **CHATGPT** | Trend Following | 3-5x | Médio prazo |
| **DEEPSEEK** | Statistical Arbitrage | 2-4x | Variável |
| **GEMINI** | Breakout Trading | 4-6x | Curto/Médio |

## 📊 Interface

- **Dashboard Overview**: Saldo total, P&L, tempo de operação
- **Gráfico de Performance**: Line chart em tempo real com 5 IAs
- **Status das IAs**: Cards com métricas individuais e ranking
- **Feed de Trading**: Mensagens ao vivo com decisões e raciocínio

## 🛡️ Gestão de Risco

**Regras Hard-coded:**
- Máximo 10% do capital por trade
- Máximo 3 posições simultâneas por IA
- Leverage limitado a 10x
- Stop loss obrigatório em todas as posições
- Modo recuperação se saldo < $50

## 📡 WebSocket Events

```typescript
// Frontend recebe:
- TRADER_UPDATE    // Atualização de status da IA
- TRADE_MESSAGE    // Mensagem de decisão de trade
- CHART_UPDATE     // Dados do gráfico
- ERROR            // Erros do sistema
- SYSTEM           // Mensagens do sistema
```

## 🔧 Desenvolvimento

```bash
# Backend com hot reload
cd backend
npm run dev

# Frontend com hot reload
cd frontend
npm run dev

# Build para produção
npm run build
```

## ⚠️ Avisos Importantes

1. **SEMPRE começar em testnet/paper trading**
2. **NUNCA usar mais capital do que pode perder**
3. **Monitorar 24/7 nas primeiras semanas**
4. **Ter kill switch pronto** (`POST /api/stop`)
5. **Manter logs de TUDO**

## 🎨 Design

- **Tema**: Dark mode com verde fluorescente (#00ff41)
- **Fonte**: Monospace (ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas)
- **Estilo**: Matrix/terminal/hacker aesthetic
- **Animações**: Glow effects, pulsing indicators
- **Responsivo**: Desktop e mobile

## 📝 API Endpoints

```
GET  /api/health       # Status do servidor
GET  /api/traders      # Lista todas as IAs e seus status
POST /api/start        # Inicia o trading engine
POST /api/stop         # Para o trading engine (KILL SWITCH)
```

## 🔮 Melhorias Futuras

- [ ] Machine learning para otimizar estratégias
- [ ] Análise de sentimento de notícias/Twitter
- [ ] Multi-exchange (além de Hyperliquid)
- [ ] Dashboard de analytics mais avançado
- [ ] Sistema de votação entre IAs
- [ ] Auto-ajuste de prompts baseado em performance

## 📄 Licença

MIT

## 🚨 Disclaimer

Este sistema é para fins educacionais. Trading de criptomoedas envolve risco significativo de perda. Use por sua conta e risco.

---

**BOA SORTE! 🚀💰**
