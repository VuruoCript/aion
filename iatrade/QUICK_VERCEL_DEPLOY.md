# Quick Vercel Deploy - AION Trading System

## 🚀 Fast Deployment Steps

### 1. Deploy Frontend (5 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `VuruoCript/aion` repository
3. Settings:
   ```
   Root Directory: frontend
   Framework: Vite
   Build Command: npm run build
   Output Directory: dist
   ```
4. **Environment Variables** → Add:
   ```
   VITE_API_URL=https://your-backend-name.vercel.app
   VITE_WS_URL=wss://your-backend-name.vercel.app
   ```
5. Click **Deploy**

### 2. Deploy Backend (5 minutes)

1. Go to [vercel.com/new](https://vercel.com/new) again
2. Import `VuruoCript/aion` repository
3. Settings:
   ```
   Root Directory: backend
   Framework: Other
   Build Command: npm install
   ```
4. **Environment Variables** → Add minimum required:
   ```
   NODE_ENV=production
   OPENAI_API_KEY=sk-your-key-here
   HYPERLIQUID_API_KEY=your-key
   HYPERLIQUID_API_SECRET=your-secret
   HYPERLIQUID_API_URL=https://api.hyperliquid.xyz
   HYPERLIQUID_TESTNET=true
   ```
5. Click **Deploy**

### 3. Update Frontend URLs

1. Go to frontend project → Settings → Environment Variables
2. Update the URLs with your actual backend URL:
   ```
   VITE_API_URL=https://aion-backend-xxx.vercel.app
   VITE_WS_URL=wss://aion-backend-xxx.vercel.app
   ```
3. Go to **Deployments** → Click ⋯ → **Redeploy**

### 4. Test Your Deployment

Visit your frontend URL and check:
- ✅ Page loads
- ✅ Dashboard displays
- ✅ Check browser console for connection status

## ⚠️ Important Notes

### WebSocket Limitations
Vercel has 60-second timeout for serverless functions. For production:
- Consider using **Railway** or **Render** for backend (better WebSocket support)
- Or use external WebSocket service (Pusher, Ably)

### Data Persistence
`trading-data.json` won't persist on Vercel. For production:
- Use **Vercel Postgres** or **Vercel KV**
- Or external database (Supabase, MongoDB Atlas)

## 🔧 Alternative: One-Click Deploy

### Using Railway (Recommended for WebSockets)

#### Backend:
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)
1. Click "Deploy from GitHub repo"
2. Select `VuruoCript/aion`
3. Root directory: `backend`
4. Add environment variables
5. Deploy

#### Frontend:
Still deploy on Vercel (it's great for static sites)

## 📝 Environment Variables Checklist

### Frontend (Vercel)
- [ ] `VITE_API_URL`
- [ ] `VITE_WS_URL`

### Backend (Vercel/Railway)
- [ ] `NODE_ENV=production`
- [ ] `OPENAI_API_KEY` (or other LLM key)
- [ ] `HYPERLIQUID_API_KEY`
- [ ] `HYPERLIQUID_API_SECRET`
- [ ] `HYPERLIQUID_API_URL`
- [ ] `HYPERLIQUID_TESTNET`

## 🆘 Troubleshooting

**CORS Error?**
- Check backend allows frontend origin
- Verify URLs don't have trailing slashes

**WebSocket not connecting?**
- Make sure using `wss://` (not `ws://`)
- Check backend is deployed and running
- Consider alternative hosting for backend

**Build fails?**
- Check Node.js version (use 18.x or 20.x)
- Run `npm install` locally to test
- Check build logs in Vercel dashboard

## 📚 Full Documentation

For detailed setup, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

---

**Need help?** Open an issue: https://github.com/VuruoCript/aion/issues
