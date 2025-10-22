# ⚡ Quick Render Deploy - 5 Minutes

## 🚀 Fastest Way: One-Click Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/VuruoCript/aion)

1. Click button above
2. Sign in to Render
3. Add your API keys
4. Click "Apply"
5. Done! ✅

---

## 📱 Manual Deploy (3 Steps)

### Step 1: Deploy Backend (3 min)

1. **Render Dashboard** → New + → Web Service
2. **Repository:** `VuruoCript/aion`
3. **Settings:**
   ```
   Name: aion-backend
   Root Directory: backend
   Build: npm install
   Start: npm run start
   Plan: Free
   ```
4. **Environment Variables:**
   ```
   NODE_ENV=production
   OPENAI_API_KEY=sk-your-key  (or other LLM key)
   HYPERLIQUID_API_KEY=your-key (optional)
   HYPERLIQUID_API_SECRET=your-secret (optional)
   HYPERLIQUID_TESTNET=true
   ```
5. **Create** → Copy backend URL

### Step 2: Deploy Frontend (2 min)

1. **Render Dashboard** → New + → Static Site
2. **Repository:** `VuruoCript/aion`
3. **Settings:**
   ```
   Name: aion-frontend
   Root Directory: frontend
   Build: npm install && npm run build
   Publish: dist
   ```
4. **Environment Variables:**
   ```
   VITE_API_URL=https://aion-backend-xxx.onrender.com
   VITE_WS_URL=wss://aion-backend-xxx.onrender.com
   ```
   (Use your backend URL from Step 1)
5. **Create**

### Step 3: Test (30 sec)

1. Open frontend URL
2. Check console: "✅ Socket connected"
3. See traders trading? **Done!** 🎉

---

## 🎯 Why Render > Vercel

| Feature | Render | Vercel |
|---------|--------|--------|
| WebSocket | ✅ Yes | ❌ No |
| 24/7 Backend | ✅ Yes | ❌ No |
| Real Trading | ✅ Yes | ❌ No |
| Free Tier | ✅ 750h | ✅ Yes |
| PostgreSQL | ✅ Yes | ❌ No |

**Result:** Render = Full features, Vercel = Demo only

---

## 💰 Pricing

**Free Plan:**
- ✅ 750 hours/month
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ 30 sec cold start

**Starter Plan ($7/month):**
- ✅ Always on
- ✅ No cold starts
- ✅ Perfect for 24/7 trading

---

## 🔧 Quick Troubleshooting

**Backend won't start?**
→ Check logs, verify API keys are set

**Frontend shows error?**
→ Update VITE_API_URL and VITE_WS_URL with correct backend URL

**Service sleeping?**
→ Upgrade to Starter plan or use UptimeRobot to ping every 5 min

---

## 📖 Full Guide

For detailed instructions: [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)

---

**Ready to deploy?** Click the blue button at the top! 🚀
