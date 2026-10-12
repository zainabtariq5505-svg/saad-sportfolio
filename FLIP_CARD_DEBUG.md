SECURITY UPDATE: Old login and database policy instructions below are obsolete. Follow SECURITY_SETUP.md before deployment.

# 🔧 Flip Card Debug Guide

## ✅ Quick Test Steps

1. **Open index.html in browser**
2. **Open Developer Tools** (Press F12)
3. **Go to Console tab** (top menu in DevTools)
4. **Click the "SMS" logo** in navbar
   - You should see: `"Card opened"` in console
   - A card should appear in the center

5. **Click on the card**
   - You should see: `"Card flipped: true"` in console
   - Card should rotate 180 degrees
   - Back side should show a pickup line

6. **Click the card again**
   - You should see: `"Card flipped: false"` in console
   - Card should rotate back 180 degrees to show front

7. **Click outside card (on overlay)**
   - You should see: `"Card closed"` in console
   - Card should disappear

---

## 🔍 If It's Not Working

### Problem: Card doesn't appear when I click SMS
**Solution:**
- Check console for errors (F12 → Console tab)
- Make sure you're clicking the **SMS** text in top-left navbar
- Refresh page (Ctrl+R)

### Problem: Card appears but doesn't flip
**Check:**
1. Open DevTools (F12)
2. Right-click the card → Inspect
3. Click on the card element in DevTools
4. Look at the right panel - check if `class="flip-card flipped"` appears when you click

**If it doesn't update:**
- Try hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Clear browser cache

### Problem: Card flips but shows only one side or both sides
**This means CSS isn't rendering correctly:**
1. In DevTools, find `.flip-card-front` and `.flip-card-back`
2. Check if they have `backface-visibility: hidden`
3. Check if `.flip-card.flipped .flip-card-inner` has `transform: rotateY(180deg)`

---

## 📝 What Should Happen

### Step-by-Step Animation:

1. **Click SMS logo** → 
   - Smooth fade-in + scale animation
   - Dark overlay appears with blur
   - Card appears in center

2. **First Click on Card** →
   - Smooth 0.6s 3D rotation
   - Front side fades out (backface-visibility: hidden)
   - Back side fades in
   - You see the pickup line!

3. **Second Click on Card** →
   - Smooth 0.6s 3D rotation back
   - Back side fades out
   - Front side fades in
   - Shows SMS and your name again

4. **Click Overlay or Press ESC** →
   - Card and overlay fade out
   - Back to normal portfolio

---

## 🎯 Console Output You Should See

```
Flip card initialized
Card opened
Card flipped: true     ← 1st click flips it
Card flipped: false    ← 2nd click flips it back
Card flipped: true     ← 3rd click flips again
Card closed            ← When you click overlay
```

---

## 💻 Browser Compatibility

The flip uses:
- CSS `transform: rotateY()`
- CSS `backface-visibility: hidden`
- CSS `transform-style: preserve-3d`
- CSS `perspective`

**Supported in:**
✅ Chrome/Edge 86+
✅ Firefox 16+
✅ Safari 9+
✅ Mobile browsers

---

## 🚨 If Nothing Works at All

1. **Hard refresh the page:**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Check browser console for errors:**
   - F12 → Console tab
   - Look for any red error messages

3. **Make sure all files are updated:**
   - index.html should have `<div class="flip-card-container">`
   - styles.css should have `.flip-card-inner { transform-style: preserve-3d; }`
   - script.js should have `initFlipCard()` function

4. **Try a different browser:**
   - Chrome, Firefox, Safari all work fine
   - Try to rule out browser-specific issues

---

## 🎉 Success Indicators

When it's working correctly, you'll see:

✅ Smooth 3D rotation animation  
✅ Both sides of card visible when flipped  
✅ Console shows "Card flipped: true/false"  
✅ Pickup line text appears on back  
✅ Smooth fade-in when opening  
✅ Overlay blur effect  
✅ ESC key closes it  
✅ Works on mobile too  

---

## 📞 Quick Fixes

| Issue | Solution |
|-------|----------|
| Card won't open | Click the **SMS** logo, not something else |
| Card won't flip | Make sure JavaScript is enabled |
| Shows both sides | Hard refresh (Ctrl+Shift+R) |
| Console errors | Check browser is up to date |
| Only sees front | Try different browser |

---

**The flip card should now work! 🎴✨**

If you still have issues, message me and we'll debug it together!
