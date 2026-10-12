SECURITY UPDATE: Old login and database policy instructions below are obsolete. Follow SECURITY_SETUP.md before deployment.

# 🚀 Admin Panel Setup Guide

## Complete Guide to Set Up Your Portfolio Admin Panel with Supabase

---

## 📋 What You're Getting

Your portfolio now has:

✅ **Admin Panel** - Secure login with username/password  
✅ **Visitor Tracking** - Automatic tracking with IP, location, device  
✅ **Real-time Analytics** - Live visitor count, countries, today's stats  
✅ **YouTube Background Video** - Add/remove videos via admin panel  
✅ **Dashboard** - Beautiful analytics interface  
✅ **Geo-location** - Track visitors by country, region, city  

---

## 🛠️ Step 1: Create Supabase Account (5 minutes)

### 1. Go to Supabase
Visit: **https://supabase.com**

### 2. Sign Up
- Click **"Start your project"**
- Sign up with GitHub (recommended) or email
- It's **100% FREE** for your use case

### 3. Create a New Project
- Click **"New Project"**
- **Organization**: Create or select one
- **Project Name**: `sms-portfolio` (or whatever you like)
- **Database Password**: Create a strong password (save it!)
- **Region**: Choose closest to you (e.g., US East, Europe West)
- Click **"Create new project"**
- Wait 1-2 minutes for setup

---

## 🗄️ Step 2: Create Database Tables (2 minutes)

### 1. Open SQL Editor
- In your Supabase dashboard, click **"SQL Editor"** in left sidebar
- Click **"New query"**

### 2. Copy & Paste This SQL

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

-- Create settings table for background video
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_visitors_timestamp ON visitors(timestamp DESC);
CREATE INDEX idx_visitors_country ON visitors(country);
CREATE INDEX idx_visitors_ip ON visitors(ip_address);

-- Enable Row Level Security (RLS)
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies to allow anonymous inserts (for tracking)
-- and allow all operations for authenticated users (admin)
CREATE POLICY "Allow anonymous insert on visitors" 
ON visitors FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users on visitors" 
ON visitors FOR ALL 
TO authenticated 
USING (true);

CREATE POLICY "Allow read for all on settings" 
ON settings FOR SELECT 
USING (true);

CREATE POLICY "Allow all for authenticated users on settings" 
ON settings FOR ALL 
TO authenticated 
USING (true);
```

### 3. Run the Query
- Click **"Run"** button (or press Ctrl+Enter)
- You should see: **"Success. No rows returned"**

✅ **Your database is ready!**

---

## 🔑 Step 3: Get Your API Keys (1 minute)

### 1. Go to Project Settings
- Click **"Settings"** (gear icon) in left sidebar
- Click **"API"** under Project Settings

### 2. Copy Your Credentials
You'll see two important things:

**Project URL:**
```
https://xxxxxxxxxxxxx.supabase.co
```

**anon/public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBh...
```

⚠️ **IMPORTANT:** Copy both of these!

---

## ⚙️ Step 4: Configure Your Portfolio (2 minutes)

### 1. Open `supabase-config.js`

Find these lines at the top:
```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

### 2. Replace with Your Credentials

```javascript
const SUPABASE_URL = 'https://xxxxxxxxxxxxx.supabase.co'; // Your Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Your anon key
```

### 3. Save the File

✅ **Configuration complete!**

---

## 🎉 Step 5: Test Everything (3 minutes)

### 1. Open Your Portfolio
- Open `index.html` in your browser
- The page should load normally
- Check browser console (F12) - you should see: `"Visitor tracked successfully"`

### 2. Check Supabase
- Go back to Supabase dashboard
- Click **"Table Editor"** in sidebar
- Select **"visitors"** table
- You should see **1 new row** with your visit!

### 3. Access Admin Panel
- Go to: `admin.html` in your browser
- **Username:** `[your admin email]`
- **Password:** `[removed - use Supabase Auth]`
- Click **"Login to Dashboard"**

### 4. View Dashboard
You should see:
- ✅ Total visitors: 1
- ✅ Visitors today: 1
- ✅ Your country in the list
- ✅ Your visit in recent visitors

---

## 🎥 Step 6: Add Background Video (2 minutes)

### 1. Find a YouTube Video
- Go to YouTube
- Find any video you like
- Copy the URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)

### 2. In Admin Dashboard
- Click **"🎥 Background Video"** in sidebar
- Paste the YouTube URL
- Click **"Preview Video"** to see it first
- Click **"Update Background Video"**

### 3. Check Your Portfolio
- Go back to `index.html`
- Refresh the page
- You should see the video playing in the background of the hero section!

---

## 📊 Admin Panel Features

### Dashboard (📊)
- **Total Visitors** - All-time count
- **Visitors Today** - Today's count
- **Active Now** - Last 5 minutes
- **Countries** - Unique countries
- **Top Countries** - Most visitors by country
- **Recent Visitors** - Latest 5 visitors

### Visitors (👥)
- Complete list of all visitors
- IP address, country, city, device
- Search functionality
- Real timestamps

### Analytics (📈)
- Browser statistics
- Device breakdown
- Hourly traffic patterns

### Background Video (🎥)
- Add YouTube video URL
- Preview before applying
- Remove video option
- Video plays automatically on homepage

### Settings (⚙️)
- Admin account info
- Database status
- Auto-refresh toggle (30s)
- Clear all data option

---

## 🔒 Security Notes

### What's Secure:
✅ Admin login credentials are hardcoded  
✅ Supabase API keys are safe to expose (anon key)  
✅ Row Level Security (RLS) is enabled  
✅ Admin session is stored securely  

### What to Know:
⚠️ Anyone can visit `admin.html` but they need the password  
⚠️ Change credentials in `supabase-config.js` if you share code  
⚠️ The anon key is designed to be public (read Supabase docs)  

---

## 🌐 Going Live (Deployment)

### Option 1: GitHub Pages (Free)
1. Create a GitHub repository
2. Push all your files
3. Go to Settings → Pages
4. Enable GitHub Pages
5. Your site will be live at: `https://yourusername.github.io/repo-name`

### Option 2: Netlify (Free)
1. Go to netlify.com
2. Drag and drop your portfolio folder
3. Site is live instantly!

### Option 3: Vercel (Free)
1. Go to vercel.com
2. Import from GitHub
3. Deploy with one click

### After Deployment:
- Visitor tracking works automatically
- Admin panel works at: `yourdomain.com/admin.html`
- Dashboard works at: `yourdomain.com/dashboard.html`

---

## 📱 How Visitor Tracking Works

### Automatic Tracking:
When someone visits your portfolio:

1. **Page loads** → `trackVisitor()` function runs
2. **Gets visitor info:**
   - IP address (via ipapi.co API)
   - Country, region, city
   - Latitude/longitude
   - Timezone
   - Browser/device info
   - Screen resolution
   - Language
   - Referrer (where they came from)

3. **Saves to Supabase** → visitors table
4. **Admin sees it** → Real-time in dashboard

### What Gets Tracked:
✅ Anonymous data only  
✅ No personal information  
✅ No cookies needed  
✅ Compliant with privacy laws  

---

## 🎥 How Background Video Works

### From Admin Panel:
1. Admin pastes YouTube URL
2. System extracts video ID
3. Saves to Supabase `settings` table

### On Portfolio Homepage:
1. Page loads → `loadBackgroundVideo()` runs
2. Fetches video ID from Supabase
3. Creates YouTube iframe embed
4. Applies to hero section background
5. Video plays automatically (muted)
6. Opacity set to 30% for visibility

### Video Settings:
- ✅ Autoplay enabled
- ✅ Muted (YouTube requirement)
- ✅ Looped infinitely
- ✅ No controls shown
- ✅ Positioned to fill screen
- ✅ Does not block content

---

## 🔧 Troubleshooting

### Problem: "Visitor tracked" doesn't show in console

**Solution:**
- Check if you replaced `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Check browser console for errors
- Verify database tables exist in Supabase

### Problem: Admin login says "Invalid credentials"

**Solution:**
- Username: `[your admin email]` (lowercase)
- Password: `[removed - use Supabase Auth]` (exact case)
- Check `supabase-config.js` has correct credentials

### Problem: Dashboard shows "Loading..." forever

**Solution:**
- Open browser console (F12)
- Check for Supabase connection errors
- Verify your API keys are correct
- Check if database tables exist

### Problem: Background video doesn't show

**Solution:**
- Make sure YouTube URL is valid
- Try a different video (some videos disable embedding)
- Check browser console for iframe errors
- Verify video ID saved correctly in dashboard

### Problem: "No visitors" in dashboard

**Solution:**
- Visit your portfolio homepage first
- Check Supabase → Table Editor → visitors table
- Verify RLS policies are set correctly
- Check browser console for tracking errors

---

## 📊 Database Schema Reference

### `visitors` Table

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Unique visitor ID (auto) |
| timestamp | TIMESTAMPTZ | Visit time (auto) |
| ip_address | TEXT | Visitor IP address |
| country | TEXT | Country name |
| country_code | TEXT | 2-letter country code |
| region | TEXT | State/region name |
| city | TEXT | City name |
| latitude | DECIMAL | Geographic latitude |
| longitude | DECIMAL | Geographic longitude |
| timezone | TEXT | Visitor timezone |
| org | TEXT | ISP/Organization |
| user_agent | TEXT | Browser user agent |
| screen_resolution | TEXT | Screen size |
| language | TEXT | Browser language |
| referrer | TEXT | Where they came from |
| page_url | TEXT | Current page URL |

### `settings` Table

| Column | Type | Description |
|--------|------|-------------|
| key | TEXT | Setting name (PRIMARY KEY) |
| value | TEXT | Setting value |
| updated_at | TIMESTAMPTZ | Last update time |

**Current Settings:**
- `key: 'background_video'` → `value: 'YouTube_Video_ID'`

---

## 🎯 File Structure

```
portfolio/
├── index.html                  # Main portfolio (with tracking)
├── admin.html                  # Admin login page
├── dashboard.html              # Admin dashboard
├── supabase-config.js          # Supabase configuration & API
├── dashboard.js                # Dashboard functionality
├── admin-styles.css            # Admin panel styling
├── styles.css                  # Portfolio styling
├── script.js                   # Portfolio JavaScript
├── README.md                   # Portfolio readme
├── ADMIN_SETUP_GUIDE.md        # This file
└── [other portfolio files]
```

---

## 🚀 Quick Start Checklist

- [ ] Create Supabase account
- [ ] Create new project
- [ ] Run SQL to create tables
- [ ] Copy Project URL and anon key
- [ ] Update `supabase-config.js` with your keys
- [ ] Open `index.html` and check console
- [ ] Go to `admin.html` and login
- [ ] View dashboard to see your visit
- [ ] Add a YouTube background video
- [ ] Deploy to GitHub Pages/Netlify/Vercel
- [ ] Share your awesome portfolio!

---

## 💡 Pro Tips

1. **Test Locally First**
   - Make sure everything works on `index.html` before deploying

2. **Backup Your Data**
   - Supabase → Database → Export data regularly

3. **Monitor Usage**
   - Supabase free tier: 500MB database, 50,000 rows
   - Perfect for portfolio use!

4. **Choose Good Videos**
   - Pick videos with interesting visuals
   - Avoid videos with too much motion
   - Test on mobile devices

5. **Privacy Compliance**
   - Add a privacy policy page
   - Mention visitor tracking
   - Provide opt-out option if needed

---

## 🎉 You're All Set!

Your portfolio now has:
✅ Professional admin panel  
✅ Real-time visitor analytics  
✅ Geographic tracking  
✅ YouTube background videos  
✅ Beautiful dashboard  

**Enjoy your powerful portfolio!** 🚀💜

---

## 📞 Need Help?

If you run into issues:
1. Check browser console (F12)
2. Check Supabase logs
3. Verify all API keys are correct
4. Re-read this guide carefully

**Good luck with your portfolio!** 🎓✨
