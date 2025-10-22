# Domain Setup Guide - aion.ai on Vercel

## 📋 DNS Configuration Required

To connect your domain `aion.ai` to Vercel, you need to add these DNS records at your domain provider (registrar where you bought the domain).

### DNS Records to Add:

#### Option 1: Using A Record (Recommended for Root Domain)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | 3600 |

**Note**: Vercel's IP may vary. Use the exact IP shown in your Vercel dashboard under the domain settings.

#### Option 2: Using CNAME (For subdomains)

If you want `www.aion.ai`:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | cname.vercel-dns.com | 3600 |

### Common Domain Providers:

#### **GoDaddy**
1. Go to https://dcc.godaddy.com/domains
2. Click on your domain `aion.ai`
3. Click "DNS" → "Manage DNS"
4. Click "Add" to add new record
5. Select Type: **A**
6. Host: **@**
7. Points to: **76.76.21.21** (or IP from Vercel)
8. TTL: **1 Hour**
9. Click "Save"

#### **Namecheap**
1. Go to https://ap.www.namecheap.com/domains/list
2. Click "Manage" next to `aion.ai`
3. Go to "Advanced DNS" tab
4. Click "Add New Record"
5. Type: **A Record**
6. Host: **@**
7. Value: **76.76.21.21** (or IP from Vercel)
8. TTL: **Automatic**
9. Click the green checkmark to save

#### **Cloudflare**
1. Go to https://dash.cloudflare.com
2. Select your domain `aion.ai`
3. Click "DNS" in the left menu
4. Click "Add record"
5. Type: **A**
6. Name: **@**
7. IPv4 address: **76.76.21.21** (or IP from Vercel)
8. Proxy status: **DNS only** (turn OFF orange cloud initially)
9. TTL: **Auto**
10. Click "Save"

#### **Google Domains (now Squarespace)**
1. Go to domains dashboard
2. Click on `aion.ai`
3. Click "DNS" on the left
4. Scroll to "Custom records"
5. Click "Manage custom records"
6. Click "Create new record"
7. Host name: **@**
8. Type: **A**
9. TTL: **1H**
10. Data: **76.76.21.21** (or IP from Vercel)
11. Click "Save"

## ⚙️ Vercel Configuration

### In Vercel Dashboard:

1. Go to your project: https://vercel.com/dashboard
2. Click on your project (aion)
3. Go to **Settings** → **Domains**
4. Click "Add Domain"
5. Enter: `aion.ai`
6. Click "Add"
7. Vercel will show you the exact DNS records needed
8. Copy the **A record IP address** shown by Vercel
9. Add that IP to your domain provider (steps above)

### Verification:

After adding DNS records:
- ⏱️ Wait 5-60 minutes for DNS propagation
- 🔄 Refresh the Vercel domains page
- ✅ Once verified, Vercel will automatically provision SSL certificate
- 🔒 Your site will be accessible via `https://aion.ai`

## 🔍 Checking DNS Propagation

Use these tools to check if DNS has propagated:

1. **Online Tools**:
   - https://dnschecker.org
   - https://www.whatsmydns.net

2. **Command Line**:
   ```bash
   # Windows
   nslookup aion.ai

   # Mac/Linux
   dig aion.ai
   ```

Expected result after propagation:
```
aion.ai.    3600    IN    A    76.76.21.21
```

## 🚨 Common Issues

### Issue: "Invalid Configuration"
**Cause**: DNS records not added or not propagated yet
**Solution**:
- Double-check DNS records at your provider
- Wait 30-60 minutes for propagation
- Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

### Issue: "DNS Not Found"
**Cause**: Wrong record type or host name
**Solution**:
- Make sure you're using **A Record** (not AAAA or CNAME for root)
- Host/Name should be **@** for root domain
- Use **www** for subdomain

### Issue: SSL Certificate Pending
**Cause**: Vercel waiting for DNS verification
**Solution**:
- DNS must be fully propagated first
- Can take up to 24 hours in rare cases
- Vercel will auto-provision SSL once DNS is verified

## 📝 Complete Checklist

- [ ] Domain registered and owned
- [ ] Access to domain provider DNS settings
- [ ] A Record added with correct IP from Vercel
- [ ] Waited at least 15-30 minutes for propagation
- [ ] Verified DNS propagation using dnschecker.org
- [ ] Refreshed Vercel domains page
- [ ] SSL certificate issued by Vercel
- [ ] Site accessible via https://aion.ai

## 🎯 Final Configuration

Once DNS is verified, your domain will automatically work with:

**Production URLs:**
- `https://aion.ai` (main domain)
- `https://www.aion.ai` (if you added www CNAME)
- `https://your-project.vercel.app` (still works as fallback)

**SSL:**
- ✅ Automatically provisioned by Vercel
- ✅ Auto-renewed
- ✅ Enforced HTTPS redirect

## 🔗 Useful Links

- Vercel Custom Domains: https://vercel.com/docs/concepts/projects/domains
- Vercel DNS Help: https://vercel.com/support/articles/how-to-add-a-custom-domain
- Check DNS: https://dnschecker.org

---

**Need Help?**
- Vercel Support: https://vercel.com/support
- DNS issues usually resolve within 1 hour
- Contact your domain registrar if DNS changes aren't saving
