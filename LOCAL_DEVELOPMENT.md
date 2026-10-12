SECURITY UPDATE: Old login and database policy instructions below are obsolete. Follow SECURITY_SETUP.md before deployment.

# 🔧 Local Development Server - Running NOW!

## ✅ Server Status: **RUNNING**

Your portfolio is now live locally at:

### 🌐 **Access URLs:**
- **Main Portfolio:** http://localhost:8000/index.html
- **Or simply:** http://localhost:8000/
- **Admin Panel:** http://localhost:8000/admin.html
- **Dashboard:** http://localhost:8000/dashboard.html

---

## 🎯 What to Test

### ✅ Main Portfolio
1. Open: http://localhost:8000/
2. Test navigation (smooth scrolling)
3. Try the hamburger menu (mobile view)
4. Click on the hero title "SMS" multiple times (flip card Easter egg)
5. Check "Developer's Reality Check" stats (click them!)
6. Hover over all 8 skills to reveal the hidden 9th skill
7. Click the "Currently" card in About section
8. Submit the contact form
9. Check browser console (F12) for any errors

### ✅ Admin Panel
1. Open: http://localhost:8000/admin.html
2. Login with:
   - **Username:** `[your admin email]`
   - **Password:** `[removed - use Supabase Auth]`
3. Test dashboard features:
   - View visitor analytics
   - Try updating background video
   - Check visitor map
   - View visitor details

### ✅ Responsive Design
1. Press F12 (Developer Tools)
2. Click device toolbar icon (or Ctrl+Shift+M)
3. Test different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

---

## 🐛 Common Issues & Fixes

### Issue: Supabase Features Not Working
**Why:** Some features require a live URL (not localhost)
**Affected:**
- Visitor tracking (geographic data)
- Contact form submissions

**Solution:** These will work once deployed. For now, you'll see console messages.

### Issue: CORS Errors
**Why:** Browser security for local files
**Solution:** Using http.server already fixes this!

### Issue: Changes Not Showing
**Solution:** 
1. Hard refresh: `Ctrl + Shift + R` (or `Ctrl + F5`)
2. Clear cache in DevTools (F12 → Network → Disable cache)

---

## 📝 Making Changes

### To Edit HTML/CSS/JS:
1. Edit files in your editor
2. Save the file
3. Refresh browser (`Ctrl + R` or `F5`)
4. Changes appear instantly!

### No Build Process Needed
This is a static site - changes are immediate!

---

## 🛑 Stop the Server

When you're done testing:
1. Go to the terminal/PowerShell window
2. Press `Ctrl + C`
3. Or just close the window

---

## 🔍 Debug Tips

### Open Browser Console
- Press `F12` or `Ctrl + Shift + I`
- Go to "Console" tab
- Look for errors (red messages)

### Check Network Tab
- Open DevTools (F12)
- Go to "Network" tab
- Reload page
- Check if all files load (green = good, red = error)

### Common Console Messages (Normal)
✅ `"✅ Supabase client initialized"`
✅ `"Supabase config loaded"`
⚠️ `"Visitor tracking works when deployed online"` (Expected locally)

---

## 📋 Testing Checklist

- [ ] Home page loads correctly
- [ ] All sections scroll smoothly
- [ ] Navigation works
- [ ] Mobile menu toggles properly
- [ ] Flip card Easter egg works (click SMS logo)
- [ ] Developer stats are clickable and animate
- [ ] Hidden skill appears after hovering all 8
- [ ] Contact form shows funny messages
- [ ] Admin panel login works
- [ ] No console errors (except Supabase warnings)
- [ ] All images/styles load
- [ ] Responsive on mobile/tablet/desktop

---

## 🚀 Next Steps

Once you're happy with local testing:
1. Follow `DEPLOY_NOW.md` for deployment
2. Deploy to Netlify/Vercel
3. Update Supabase URLs
4. Test live site

---

## ⚡ Quick Commands

### View in Browser
```
http://localhost:8000/
```

### Restart Server (if needed)
```powershell
# Stop: Ctrl + C in terminal
# Start again:
py -m http.server 8000
```

### Different Port
```powershell
py -m http.server 3000  # Use port 3000 instead
```

---

## 🎨 Files You Can Edit

- `index.html` - Main structure
- `styles.css` - All styling
- `script.js` - Interactions & Easter eggs
- `admin.html` - Admin panel
- `dashboard.js` - Dashboard logic
- `supabase-config.js` - Backend config

---

**Happy coding!** 🎉

Your server is running. Open http://localhost:8000/ in your browser now!
