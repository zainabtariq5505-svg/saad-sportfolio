SECURITY UPDATE: Old login and database policy instructions below are obsolete. Follow SECURITY_SETUP.md before deployment.

# ⚡ Quick Reference Guide

## 🔐 Admin Credentials

**Login URL:** `admin.html`

```
Username: [your admin email]
Password: [removed - use Supabase Auth]
```

---

## 🗄️ Supabase SQL Setup

Run this in Supabase SQL Editor:

```sql
-- Create visitors table
CREATE TABLE visitors (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    country TEXT,
    country_code TEXT,
    region TEXT,
    city TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    timezone TEXT,
    org TEXT,
    user_agent TEXT,
    screen_resolution TEXT,
    language TEXT,
    referrer TEXT,
    page_url TEXT
);

-- Create settings table
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_visitors_timestamp ON visitors(timestamp DESC);
CREATE INDEX idx_visitors_country ON visitors(country);
CREATE INDEX idx_visitors_ip ON visitors(ip_address);

-- Enable RLS
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow anonymous insert on visitors" 
ON visitors FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users on visitors" 
ON visitors FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow read for all on settings" 
ON settings FOR SELECT USING (true);

CREATE POLICY "Allow all for authenticated users on settings" 
ON settings FOR ALL TO authenticated USING (true);
```

---

## ⚙️ Configuration File

**File:** `supabase-config.js`

Replace these lines:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

With your actual Supabase credentials from:
**Settings → API** in Supabase dashboard

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `index.html` | Main portfolio + tracking |
| `admin.html` | Admin login |
| `dashboard.html` | Admin dashboard |
| `supabase-config.js` | API & configuration |
| `dashboard.js` | Dashboard logic |
| `admin-styles.css` | Admin styling |

---

## 🎥 YouTube Video Format

**Supported URLs:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- Just the `VIDEO_ID` directly

**Example:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

---

## 🚀 Deployment Checklist

- [ ] Update `supabase-config.js` with your keys
- [ ] Test locally first
- [ ] Deploy to hosting (GitHub Pages/Netlify/Vercel)
- [ ] Test admin login on live site
- [ ] Test visitor tracking
- [ ] Test background video

---

## 🔍 Testing Steps

1. **Visit `index.html`**
   - Check console: "Visitor tracked successfully"

2. **Check Supabase**
   - Table Editor → visitors → See your visit

3. **Login to admin**
   - Go to `admin.html`
   - Use credentials above
   - Should redirect to dashboard

4. **View Analytics**
   - Dashboard should show your visit
   - Country should be listed

5. **Add Video**
   - Background Video section
   - Paste YouTube URL
   - Update and refresh homepage

---

## 💡 Quick Fixes

### Tracking Not Working?
```javascript
// Check console for errors
// Verify SUPABASE_URL and SUPABASE_ANON_KEY are set
```

### Admin Won't Login?
```
Username must be: [your admin email] (lowercase)
Password must be: [removed - use Supabase Auth] (exact case)
```

### Video Not Showing?
```
1. Check if video allows embedding
2. Try different YouTube video
3. Check browser console for errors
4. Verify video ID saved in dashboard
```

### Dashboard Stuck on Loading?
```
1. Check browser console (F12)
2. Verify Supabase credentials
3. Check database tables exist
4. Test Supabase connection
```

---

## 📊 Dashboard Features

| Section | What It Shows |
|---------|---------------|
| **Dashboard** | Overview, stats, top countries, recent visitors |
| **Visitors** | Complete list with search |
| **Analytics** | Browsers, devices, traffic patterns |
| **Background Video** | YouTube video management |
| **Settings** | Admin info, auto-refresh, clear data |

---

## 🎯 URLs After Deployment

```
Portfolio: https://yourdomain.com/
Admin Login: https://yourdomain.com/admin.html
Dashboard: https://yourdomain.com/dashboard.html
```

---

## 🔗 Useful Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Supabase Docs:** https://supabase.com/docs
- **IP Geolocation API:** https://ipapi.co
- **YouTube Embed Docs:** https://developers.google.com/youtube/player_parameters

---

## 📞 Support

**Check logs:**
- Browser Console (F12)
- Supabase → Logs
- Network tab for API errors

**Common Issues:**
1. Wrong credentials → Check spelling/case
2. Tracking fails → Check Supabase keys
3. Video not showing → Check embed permissions
4. Dashboard empty → Visit homepage first

---

**That's it! You're ready to go!** 🚀💜
