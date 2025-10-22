# Quick Domain Setup - aion.ai

## 🚀 3-Step Setup (5 minutes)

### Step 1: Get DNS Info from Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add domain: `aion.ai`
3. **Copy the A Record IP address** shown by Vercel (usually `76.76.21.21`)

### Step 2: Add DNS Record at Your Domain Provider

Go to your domain registrar (where you bought `aion.ai`):

**Add this DNS record:**
```
Type: A
Name: @
Value: 76.76.21.21  (use IP from Vercel)
TTL: 3600 (1 hour)
```

**Common Providers Quick Links:**
- **GoDaddy**: https://dcc.godaddy.com/domains → Manage → DNS
- **Namecheap**: https://ap.www.namecheap.com/domains → Manage → Advanced DNS
- **Cloudflare**: https://dash.cloudflare.com → DNS → Add Record
- **Google Domains**: domains dashboard → DNS → Custom records

### Step 3: Wait & Verify
1. ⏱️ Wait 15-30 minutes for DNS propagation
2. 🔍 Check propagation: https://dnschecker.org (search for `aion.ai`)
3. ✅ Refresh Vercel domains page - it should show "Valid Configuration"
4. 🔒 Vercel will auto-issue SSL certificate
5. 🎉 Visit https://aion.ai

## ⚡ Troubleshooting

**"Invalid Configuration" in Vercel?**
→ DNS not propagated yet. Wait 30 more minutes.

**Can't find DNS settings?**
→ Contact your domain registrar support.

**DNS propagated but Vercel shows error?**
→ Try removing and re-adding the domain in Vercel.

## 📱 Quick Check Commands

**Windows:**
```bash
nslookup aion.ai
```

**Mac/Linux:**
```bash
dig aion.ai
```

**Expected result:**
```
aion.ai.    IN    A    76.76.21.21
```

---

**That's it!** After DNS propagates, your site will be live at https://aion.ai 🚀

For detailed instructions, see [DOMAIN_SETUP.md](./DOMAIN_SETUP.md)
