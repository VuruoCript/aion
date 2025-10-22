# Vercel Deployment Guide - AION AI Trading System

## Overview
This guide will help you deploy the AION AI Trading System on Vercel with both frontend and backend.

## Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository connected to Vercel
- Environment variables ready

## Deployment Options

### Option 1: Monorepo Deployment (Recommended)

Deploy both frontend and backend from a single repository.

#### Step 1: Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

#### Step 2: Deploy Frontend

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository: `VuruoCript/aion`
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables (click "Environment Variables"):
   ```
   VITE_API_URL=https://your-backend.vercel.app
   VITE_WS_URL=wss://your-backend.vercel.app
   ```

6. Click "Deploy"

#### Step 3: Deploy Backend

1. Go to Vercel Dashboard again
2. Click "Add New Project"
3. Import the same repository: `VuruoCript/aion`
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001

   # Hyperliquid API
   HYPERLIQUID_API_KEY=your_api_key_here
   HYPERLIQUID_API_SECRET=your_api_secret_here
   HYPERLIQUID_API_URL=https://api.hyperliquid.xyz
   HYPERLIQUID_TESTNET=true

   # LLM API Keys
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   XAI_API_KEY=xai-...
   DEEPSEEK_API_KEY=sk-...
   GOOGLE_API_KEY=...

   # Trading Configuration
   INITIAL_BALANCE_PER_AI=200
   TRADING_INTERVAL_SECONDS=45
   MAX_POSITIONS_PER_AI=3
   MAX_LEVERAGE=10
   MAX_RISK_PER_TRADE_PERCENT=10

   # Logging
   LOG_LEVEL=info
   ```

6. Click "Deploy"

#### Step 4: Update Frontend Environment Variables

After backend is deployed, go back to your frontend project settings and update:
```
VITE_API_URL=https://your-backend-project.vercel.app
VITE_WS_URL=wss://your-backend-project.vercel.app
```

Then redeploy the frontend.

### Option 2: Using Vercel CLI

#### Deploy Frontend
```bash
cd frontend
vercel --prod
```

#### Deploy Backend
```bash
cd backend
vercel --prod
```

## Environment Variables Configuration

### Frontend Environment Variables
Create `.env.production` in frontend folder:
```env
VITE_API_URL=https://your-backend.vercel.app
VITE_WS_URL=wss://your-backend.vercel.app
```

### Backend Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- `NODE_ENV=production`
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` (at least one LLM provider)
- `HYPERLIQUID_API_KEY`
- `HYPERLIQUID_API_SECRET`

**Optional:**
- `XAI_API_KEY`
- `DEEPSEEK_API_KEY`
- `GOOGLE_API_KEY`
- `DATABASE_URL` (if using external database)
- `INITIAL_BALANCE_PER_AI=200`
- `TRADING_INTERVAL_SECONDS=45`
- `MAX_POSITIONS_PER_AI=3`
- `MAX_LEVERAGE=10`
- `MAX_RISK_PER_TRADE_PERCENT=10`
- `LOG_LEVEL=info`

## Important Notes

### WebSocket Limitations
Vercel has some limitations with WebSockets:
- Serverless functions have a 60-second timeout
- For persistent WebSocket connections, consider using:
  - **Vercel Edge Functions** (recommended)
  - **External WebSocket service** (Pusher, Ably, Socket.io hosted)
  - **Alternative hosting** for backend (Railway, Render, Fly.io)

### Database Consideration
For production, use an external database:
- **PostgreSQL**: Supabase, Neon, Railway
- **MongoDB**: MongoDB Atlas
- **Redis**: Upstash (for caching/sessions)

Update `DATABASE_URL` environment variable accordingly.

### File Persistence
Vercel serverless functions are stateless. The `backend/data/trading-data.json` won't persist between deployments.

**Solutions:**
1. Use external database (recommended)
2. Use Vercel KV (Redis-compatible storage)
3. Use external storage (S3, Google Cloud Storage)

## Post-Deployment

### 1. Test the Deployment
Visit your frontend URL and check:
- ✅ Frontend loads correctly
- ✅ API connections work
- ✅ WebSocket connects (check browser console)
- ✅ Trading data displays

### 2. Monitor Logs
- Go to Vercel Dashboard → Your Project → Functions
- Check logs for errors
- Monitor performance

### 3. Set Up Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## Troubleshooting

### CORS Errors
Make sure backend allows frontend origin:
```typescript
// In server-new.ts
const corsOptions = {
  origin: ['https://your-frontend.vercel.app'],
  credentials: true
}
```

### WebSocket Connection Failed
- Check if WS_URL uses `wss://` (not `ws://`)
- Verify backend is deployed and running
- Check browser console for detailed errors

### Build Failures
- Check build logs in Vercel Dashboard
- Verify all dependencies are in `package.json`
- Make sure TypeScript compiles without errors locally

### Environment Variables Not Working
- Variables starting with `VITE_` are required for frontend
- Redeploy after adding/changing environment variables
- Check if variables are set in the correct environment (Production/Preview/Development)

## Alternative: All-in-One Deployment

For simpler deployments, consider:
- **Railway**: Better WebSocket support, PostgreSQL included
- **Render**: Free tier with persistent storage
- **Fly.io**: Global edge deployment
- **Heroku**: Traditional PaaS with addons

## Support

For issues or questions:
- Check Vercel documentation: https://vercel.com/docs
- GitHub Issues: https://github.com/VuruoCript/aion/issues

---

**Note**: For production trading with real money, ensure all API keys are properly secured and never commit them to the repository.
