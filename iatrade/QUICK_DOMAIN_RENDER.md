# ⚡ Quick Domain Setup - Render

## 🚀 3 Steps to aion.ai

### Step 1: Render Dashboard (2 min)

1. Go to: https://dashboard.render.com
2. Click your **aion-frontend** service
3. Click **"Settings"** (sidebar)
4. Find **"Custom Domain"**
5. Click **"Add Custom Domain"**
6. Type: `aion.ai`
7. Click **"Save"**

**Copy the CNAME value shown!** (like `aion-frontend-xxx.onrender.com`)

---

### Step 2: Domain Provider (2 min)

Go to where you bought `aion.ai`:

**Add DNS Record:**
```
Type: CNAME
Name: @ (or aion.ai)
Value: aion-frontend-xxx.onrender.com  ← (from Step 1)
TTL: 600 or Auto
```

**Quick Links:**
- GoDaddy: https://dcc.godaddy.com/domains
- Namecheap: https://ap.www.namecheap.com/domains
- Cloudflare: https://dash.cloudflare.com

Click **Save**

---

### Step 3: Wait (15-30 min)

**DNS Propagation:**
- ⏱️ Usually 15-30 minutes
- Check: https://dnschecker.org (search for `aion.ai`)

**SSL Certificate:**
- ✅ Render auto-provisions SSL (free)
- ✅ Takes 5-10 min after DNS propagates

---

## ✅ Done!

Visit: **https://aion.ai** 🎉

Your site is now live with:
- ✅ Custom domain
- ✅ Free SSL certificate
- ✅ Auto HTTPS redirect

---

## 🎯 Bonus: API Subdomain

Want `api.aion.ai` for backend?

**In Render:**
1. Go to **aion-backend** service
2. Settings → Custom Domain
3. Add: `api.aion.ai`

**In DNS Provider:**
```
Type: CNAME
Name: api
Value: aion-backend-xxx.onrender.com
```

**Update Frontend Env:**
```
VITE_API_URL=https://api.aion.ai
VITE_WS_URL=wss://api.aion.ai
```

Redeploy frontend → Done!

---

## 🆘 Troubleshooting

**"Domain not verified"**
→ Wait 30 more minutes for DNS

**"SSL Certificate Pending"**
→ DNS must propagate first, be patient

**"Too many redirects" (Cloudflare)**
→ Turn proxy to **DNS only** (gray cloud)

---

**Full Guide:** [RENDER_CUSTOM_DOMAIN.md](./RENDER_CUSTOM_DOMAIN.md)
