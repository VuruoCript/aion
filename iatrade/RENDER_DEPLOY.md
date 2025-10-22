# 🚀 Deploy AION to Render - Complete Guide

Render is the **recommended** platform for AION because it supports:
- ✅ **WebSocket** (real-time trading)
- ✅ **Persistent processes** (trading engine)
- ✅ **Free tier** (750 hours/month)
- ✅ **PostgreSQL** (optional)
- ✅ **Auto-deploy** from GitHub

## 🎯 Quick Deploy (5 Minutes)

### Option 1: One-Click Deploy (Easiest)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/VuruoCript/aion)

1. Click the button above
2. Sign in to Render (or create account)
3. Fill in environment variables (API keys)
4. Click "Apply"
5. Wait 5-10 minutes for deployment
6. Done! 🎉

### Option 2: Manual Setup (More Control)

## 📋 Step-by-Step Manual Deployment

### Step 1: Create Render Account

1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### Step 2: Deploy Backend

1. In Render Dashboard, click **"New +"** → **"Web Service"**

2. **Connect Repository:**
   - Select `VuruoCript/aion` from your repositories
   - If not listed, click "Configure account" to grant access

3. **Configure Service:**
   ```
   Name: aion-backend
   Region: Oregon (US West) - or closest to you
   Branch: master
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm run start
   ```

4. **Select Plan:**
   - Choose **"Free"** (750 hours/month, sleeps after inactivity)
   - Or **"Starter"** ($7/month, always on, better for 24/7 trading)

5. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable"

   **Required:**
   ```
   NODE_ENV=production
   PORT=3001

   # At least one LLM API key
   OPENAI_API_KEY=sk-your-key-here
   # OR
   ANTHROPIC_API_KEY=sk-ant-your-key-here

   # HyperLiquid (if using real trading)
   HYPERLIQUID_API_KEY=your-key
   HYPERLIQUID_API_SECRET=your-secret
   HYPERLIQUID_API_URL=https://api.hyperliquid.xyz
   HYPERLIQUID_TESTNET=true
   ```

   **Optional:**
   ```
   XAI_API_KEY=xai-...
   DEEPSEEK_API_KEY=sk-...
   GOOGLE_API_KEY=...
   INITIAL_BALANCE_PER_AI=200
   TRADING_INTERVAL_SECONDS=45
   MAX_POSITIONS_PER_AI=3
   MAX_LEVERAGE=10
   MAX_RISK_PER_TRADE_PERCENT=10
   LOG_LEVEL=info
   ```

6. **Deploy:**
   - Click **"Create Web Service"**
   - Wait 5-10 minutes for build and deployment
   - Copy the backend URL (e.g., `https://aion-backend-xxx.onrender.com`)

### Step 3: Deploy Frontend

1. In Render Dashboard, click **"New +"** → **"Static Site"**

2. **Connect Repository:**
   - Select `VuruoCript/aion` again

3. **Configure Site:**
   ```
   Name: aion-frontend
   Region: Oregon (same as backend)
   Branch: master
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. **Add Environment Variables:**
   ```
   VITE_API_URL=https://aion-backend-xxx.onrender.com
   VITE_WS_URL=wss://aion-backend-xxx.onrender.com
   ```
   ⚠️ Replace `xxx` with your actual backend URL!

5. **Deploy:**
   - Click **"Create Static Site"**
   - Wait 3-5 minutes
   - Your frontend URL: `https://aion-frontend-xxx.onrender.com`

### Step 4: Test Deployment

1. **Open Frontend URL** in browser
2. **Check Browser Console** - should see:
   ```
   🔌 Connecting to WebSocket backend
   ✅ Socket connected
   📦 Received initial state
   ```
3. **Verify Dashboard:**
   - AI traders visible
   - Chart updating
   - Trading messages appearing
   - No connection errors

## 🎨 Custom Domain (Optional)

### Connect aion.ai to Render:

1. **In Render Dashboard:**
   - Go to your frontend service
   - Click "Settings" → "Custom Domain"
   - Click "Add Custom Domain"
   - Enter: `aion.ai`
   - Copy the CNAME value

2. **In Your Domain Provider:**
   - Add CNAME record:
     ```
     Type: CNAME
     Name: @ (or aion.ai)
     Value: aion-frontend-xxx.onrender.com
     TTL: 3600
     ```

3. **SSL Certificate:**
   - Render automatically provisions SSL
   - Takes 5-10 minutes after DNS propagation
   - Your site: `https://aion.ai` 🔒

## ⚙️ Configuration Options

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | development | Set to `production` |
| `PORT` | No | 3001 | Server port (Render sets automatically) |
| `OPENAI_API_KEY` | One of* | - | OpenAI GPT API key |
| `ANTHROPIC_API_KEY` | One of* | - | Anthropic Claude API key |
| `XAI_API_KEY` | No | - | xAI Grok API key |
| `DEEPSEEK_API_KEY` | No | - | DeepSeek API key |
| `GOOGLE_API_KEY` | No | - | Google Gemini API key |
| `HYPERLIQUID_API_KEY` | No** | - | HyperLiquid API key |
| `HYPERLIQUID_API_SECRET` | No** | - | HyperLiquid API secret |
| `HYPERLIQUID_TESTNET` | No | true | Use testnet (true/false) |
| `INITIAL_BALANCE_PER_AI` | No | 200 | Starting balance per AI |
| `TRADING_INTERVAL_SECONDS` | No | 45 | Seconds between trades |
| `MAX_POSITIONS_PER_AI` | No | 3 | Max simultaneous positions |
| `MAX_LEVERAGE` | No | 10 | Maximum leverage |
| `LOG_LEVEL` | No | info | Logging level |

\* At least one LLM API key required
\** Required only for real trading

### Frontend Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend URL (https://...) |
| `VITE_WS_URL` | Yes | Backend WebSocket URL (wss://...) |

## 🔄 Auto-Deploy Setup

Render automatically deploys when you push to GitHub:

1. Make changes to code
2. `git commit -m "your message"`
3. `git push origin master`
4. Render detects push and deploys automatically
5. Wait 2-5 minutes
6. New version live!

**Disable auto-deploy:**
- Service Settings → "Auto-Deploy" → Toggle OFF

## 📊 Monitoring & Logs

### View Logs:

1. Go to Render Dashboard
2. Click on your service (backend or frontend)
3. Click "Logs" tab
4. Real-time logs appear

### Useful Log Commands:

```bash
# Check backend status
curl https://aion-backend-xxx.onrender.com/api/health

# View recent logs
# (in Render dashboard, Logs tab)
```

### Metrics:

- **Dashboard** → Service → "Metrics"
- See CPU, memory, bandwidth usage
- Track response times

## 💰 Cost Breakdown

### Free Tier:
- ✅ 750 hours/month (enough for 1 service 24/7)
- ✅ 100 GB bandwidth/month
- ✅ Auto SSL certificates
- ⚠️ Services sleep after 15 min inactivity
- ⚠️ 30 second cold start when waking

### Starter Plan ($7/month per service):
- ✅ Always on (no sleep)
- ✅ Faster builds
- ✅ More bandwidth
- ✅ Priority support
- ✅ Better for 24/7 trading

**Recommendation:**
- Development: Free tier
- Production/24/7 Trading: Starter plan ($14/month for backend + frontend)

## 🔧 Troubleshooting

### Backend Won't Start:

**Check Logs for:**
```
Error: Cannot find module...
```
**Fix:** Missing dependency in package.json

```
Error: OPENAI_API_KEY is not defined
```
**Fix:** Add API key in environment variables

### Frontend Shows "Connection Error":

**Check:**
1. Backend is running (visit backend URL/api/health)
2. VITE_API_URL and VITE_WS_URL are correct
3. No typos in URLs (https:// and wss://)

**Fix:**
- Update frontend env vars with correct backend URL
- Trigger manual deploy

### "Service Unavailable" Error:

**Cause:** Free tier service went to sleep
**Fix:**
- Visit backend URL to wake it up
- Or upgrade to Starter plan ($7/month)

### Database Connection Issues:

If using PostgreSQL:
1. Verify DATABASE_URL env var
2. Check PostgreSQL service is running
3. Ensure connection string is correct

## 🚀 Optimization Tips

### 1. Use Starter Plan for Backend
For 24/7 trading, use Starter plan to avoid cold starts

### 2. Health Check Pinging
Keep free tier awake:
- Use UptimeRobot (free) to ping every 5 minutes
- Add health check URL: `https://your-backend.onrender.com/api/health`

### 3. Enable Disk Persistence
For trading data persistence:
- Add persistent disk in service settings
- Mount at `/app/data`
- Data survives restarts

### 4. Use Environment Groups
Group common env vars:
- Dashboard → "Environment Groups"
- Create group with shared variables
- Apply to multiple services

## 📚 Additional Resources

- **Render Docs:** https://render.com/docs
- **Node.js Guide:** https://render.com/docs/deploy-node-express-app
- **Static Sites:** https://render.com/docs/static-sites
- **Custom Domains:** https://render.com/docs/custom-domains
- **Environment Variables:** https://render.com/docs/environment-variables

## 🆘 Support

- **Render Community:** https://community.render.com
- **Status Page:** https://status.render.com
- **GitHub Issues:** https://github.com/VuruoCript/aion/issues

---

## ✅ Deployment Checklist

- [ ] Render account created
- [ ] GitHub repository connected
- [ ] Backend service created
- [ ] Backend environment variables set
- [ ] Backend deployed successfully
- [ ] Backend health check passes
- [ ] Frontend service created
- [ ] Frontend environment variables set (with backend URL)
- [ ] Frontend deployed successfully
- [ ] Dashboard loads without errors
- [ ] WebSocket connected (check console)
- [ ] Trading data displaying
- [ ] (Optional) Custom domain configured
- [ ] (Optional) Upgraded to Starter plan

---

**🎉 Congratulations!** Your AION Trading System is now live on Render with full WebSocket support!

**Frontend:** https://aion-frontend-xxx.onrender.com
**Backend API:** https://aion-backend-xxx.onrender.com

For the best experience, consider upgrading to Starter plan ($7/month per service) for 24/7 uptime.
