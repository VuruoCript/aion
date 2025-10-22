# 🌐 Configure Custom Domain on Render - aion.ai

## Quick Steps (5 minutes)

### Step 1: Add Domain in Render

1. **Go to Render Dashboard:** https://dashboard.render.com
2. **Select your service** (aion-frontend)
3. Click **"Settings"** (left sidebar)
4. Scroll to **"Custom Domain"** section
5. Click **"Add Custom Domain"**
6. Enter: `aion.ai`
7. Click **"Save"**

Render will show you the DNS records to add.

### Step 2: Get DNS Information from Render

After adding the domain, Render will display something like:

```
Add these DNS records at your domain provider:

Type: CNAME
Name: aion.ai (or @)
Value: aion-frontend-xxx.onrender.com
```

**Copy this CNAME value!**

### Step 3: Add DNS Record at Your Domain Provider

Go to where you bought `aion.ai` and add the DNS record:

#### If using **GoDaddy**:
1. Go to: https://dcc.godaddy.com/domains
2. Click "DNS" next to `aion.ai`
3. Click "Add" → Select **CNAME**
4. Name: `@` (or leave blank for root)
5. Value: `aion-frontend-xxx.onrender.com` (from Render)
6. TTL: 600 (10 minutes)
7. Save

#### If using **Namecheap**:
1. Go to: https://ap.www.namecheap.com/domains
2. Click "Manage" → "Advanced DNS"
3. Add New Record → **CNAME Record**
4. Host: `@`
5. Value: `aion-frontend-xxx.onrender.com`
6. TTL: Automatic
7. Save

#### If using **Cloudflare**:
1. Go to: https://dash.cloudflare.com
2. Select `aion.ai`
3. Click "DNS"
4. Add record → **CNAME**
5. Name: `@`
6. Target: `aion-frontend-xxx.onrender.com`
7. Proxy status: **DNS only** (gray cloud, not orange)
8. Save

#### If using **Google Domains** (now Squarespace):
1. Go to domains dashboard
2. Click `aion.ai` → "DNS"
3. Custom records → "Create new record"
4. Type: **CNAME**
5. Host: `@`
6. Data: `aion-frontend-xxx.onrender.com`
7. Save

### Step 4: Wait for DNS Propagation

- ⏱️ Usually takes **5-30 minutes**
- Sometimes up to **24 hours** (rare)

**Check propagation:**
- Visit: https://dnschecker.org
- Enter: `aion.ai`
- Should see your Render CNAME

### Step 5: SSL Certificate

Once DNS propagates:
- ✅ Render automatically provisions SSL certificate
- ✅ Takes 5-10 minutes after DNS is verified
- ✅ Your site will be accessible at `https://aion.ai`
- ✅ HTTP automatically redirects to HTTPS

## 🎯 For Subdomain (www.aion.ai)

Want both `aion.ai` AND `www.aion.ai`?

### In Render:
1. Add domain: `aion.ai` (root)
2. Add domain: `www.aion.ai` (subdomain)

### In DNS Provider:
Add TWO records:

```
Type: CNAME
Name: @
Value: aion-frontend-xxx.onrender.com

Type: CNAME
Name: www
Value: aion-frontend-xxx.onrender.com
```

## 🔧 Advanced: API Subdomain

Want `api.aion.ai` for backend?

### In Render (Backend Service):
1. Go to **aion-backend** service
2. Settings → Custom Domain
3. Add: `api.aion.ai`
4. Copy the CNAME value

### In DNS Provider:
```
Type: CNAME
Name: api
Value: aion-backend-xxx.onrender.com
```

### Update Frontend:
Update environment variables in frontend:
```
VITE_API_URL=https://api.aion.ai
VITE_WS_URL=wss://api.aion.ai
```

Redeploy frontend after changing env vars.

## ✅ Verification Checklist

- [ ] Domain added in Render dashboard
- [ ] CNAME record added at domain provider
- [ ] DNS propagation complete (check dnschecker.org)
- [ ] SSL certificate issued by Render
- [ ] Site accessible at https://aion.ai
- [ ] No security warnings in browser
- [ ] HTTP redirects to HTTPS automatically

## 🚨 Troubleshooting

### Issue: "Domain not verified"
**Cause:** DNS not propagated yet
**Fix:**
- Wait 30 more minutes
- Check DNS with `nslookup aion.ai`
- Verify CNAME points to correct Render URL

### Issue: "SSL Certificate Pending"
**Cause:** Waiting for DNS verification
**Fix:**
- DNS must be fully propagated first
- Can take up to 24 hours in rare cases
- Render will auto-provision once DNS verified

### Issue: "Too many redirects"
**Cause:** Cloudflare proxy + Render SSL conflict
**Fix:**
- In Cloudflare, set proxy status to **DNS only** (gray cloud)
- Wait a few minutes
- Try again

### Issue: CNAME not allowed for root domain
Some DNS providers don't allow CNAME for root (@).

**Solution 1: Use ALIAS record (if supported)**
```
Type: ALIAS (or ANAME)
Name: @
Value: aion-frontend-xxx.onrender.com
```

**Solution 2: Use Cloudflare (recommended)**
- Transfer DNS to Cloudflare (free)
- Cloudflare supports CNAME flattening for root domains
- Better performance with global CDN

**Solution 3: Use www redirect**
- Add CNAME for `www.aion.ai`
- Set up redirect from `aion.ai` to `www.aion.ai` at domain provider

## 🔍 Check DNS Commands

**Windows:**
```bash
nslookup aion.ai
```

**Mac/Linux:**
```bash
dig aion.ai
```

**Expected result after propagation:**
```
aion.ai.    CNAME    aion-frontend-xxx.onrender.com.
```

## 📊 Complete Setup Example

### Frontend (aion.ai):
```
Service: aion-frontend
Domain: aion.ai
DNS: CNAME → aion-frontend-abc123.onrender.com
SSL: Auto (Let's Encrypt)
```

### Backend (api.aion.ai):
```
Service: aion-backend
Domain: api.aion.ai
DNS: CNAME → aion-backend-xyz789.onrender.com
SSL: Auto (Let's Encrypt)
```

### URLs After Setup:
- Frontend: `https://aion.ai`
- Backend API: `https://api.aion.ai/api/health`
- WebSocket: `wss://api.aion.ai`

## 🎨 Bonus: Email Setup

Want email like `hello@aion.ai`?

Use **Cloudflare Email Routing** (free):
1. Add domain to Cloudflare
2. Enable Email Routing
3. Create forwards: `hello@aion.ai` → your-email@gmail.com
4. Free forever!

## 🆘 Need Help?

- **Render Docs:** https://render.com/docs/custom-domains
- **Check DNS:** https://dnschecker.org
- **Render Status:** https://status.render.com
- **Support:** https://community.render.com

---

## 📝 Summary

1. ✅ Add domain in Render dashboard
2. ✅ Add CNAME record at domain provider
3. ✅ Wait for DNS propagation (15-30 min)
4. ✅ Render auto-provisions SSL
5. ✅ Visit https://aion.ai - Done! 🎉

**Time:** 5-30 minutes total

**Cost:** $0 (domain + SSL both free on Render)
