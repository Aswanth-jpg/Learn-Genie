# 🚀 Render Deployment Checklist

## Pre-Deployment ✅

- [x] All code updated to use environment variables
- [x] CORS configured for production
- [x] API configuration centralized
- [x] Environment templates created
- [x] Deployment configs created

## MongoDB Atlas Setup 🗄️

- [ ] Login to [MongoDB Atlas](https://cloud.mongodb.com/)
- [ ] Go to Network Access
- [ ] Click "Add IP Address"
- [ ] Add `0.0.0.0/0` (Allow from anywhere)
- [ ] Confirm and Save
- [ ] Copy your connection string

## Razorpay Setup 💳

- [ ] Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
- [ ] Go to Settings → API Keys
- [ ] Generate/Copy Test Keys:
  - [ ] Key ID: `rzp_test_xxxxx`
  - [ ] Key Secret: `xxxxx`
- [ ] For production: Switch to Live Keys later

## GitHub Repository 📦

- [ ] All changes committed:
  ```bash
  git add .
  git commit -m "Prepared for Render deployment"
  git push origin main
  ```
- [ ] Repository is public or Render has access

---

## Render Deployment Steps

### 1️⃣ Deploy Backend (5 minutes)

- [ ] Go to [render.com](https://render.com) dashboard
- [ ] Click **New** → **Web Service**
- [ ] Connect GitHub → Select `Learn-Genie` repo
- [ ] Configure:
  - [ ] Name: `learngenie-backend`
  - [ ] Root Directory: `BACKEND`
  - [ ] Runtime: `Node`
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`
  - [ ] Instance Type: `Free`

- [ ] Add Environment Variables:
  ```
  MONGO_URI=<your-mongodb-connection-string>
  PORT=5000
  NODE_ENV=production
  RAZORPAY_KEY_ID=<your-razorpay-key-id>
  RAZORPAY_KEY_SECRET=<your-razorpay-secret>
  ```

- [ ] Click **Create Web Service**
- [ ] Wait for deployment (2-3 minutes)
- [ ] ✏️ **Copy Backend URL**: ___________________________________

### 2️⃣ Deploy AI Service (3 minutes)

- [ ] Click **New** → **Web Service**
- [ ] Connect same GitHub repo
- [ ] Configure:
  - [ ] Name: `learngenie-ai`
  - [ ] Root Directory: `FAST_API`
  - [ ] Runtime: `Python 3`
  - [ ] Build Command: `pip install -r requirements.txt`
  - [ ] Start Command: `uvicorn recommendation_api:app --host 0.0.0.0 --port $PORT`
  - [ ] Instance Type: `Free`

- [ ] Click **Create Web Service**
- [ ] Wait for deployment (2-3 minutes)
- [ ] ✏️ **Copy AI Service URL**: ___________________________________

### 3️⃣ Deploy Frontend (5 minutes)

- [ ] Click **New** → **Static Site**
- [ ] Connect same GitHub repo
- [ ] Configure:
  - [ ] Name: `learngenie-frontend`
  - [ ] Root Directory: `FRONTEND`
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Publish Directory: `dist`

- [ ] Add Environment Variables (use URLs from steps 1 & 2):
  ```
  VITE_API_URL=<backend-url-from-step-1>
  VITE_AI_URL=<ai-service-url-from-step-2>
  VITE_RAZORPAY_KEY_ID=<your-razorpay-key-id>
  ```

- [ ] Click **Create Static Site**
- [ ] Wait for deployment (3-4 minutes)
- [ ] ✏️ **Copy Frontend URL**: ___________________________________

### 4️⃣ Update Backend CORS (2 minutes)

- [ ] Go back to **Backend** service in Render
- [ ] Click **Environment** tab
- [ ] Click **Add Environment Variable**
- [ ] Add:
  ```
  FRONTEND_URL=<frontend-url-from-step-3>
  ```
- [ ] Click **Save Changes**
- [ ] Service will auto-redeploy (1-2 minutes)

---

## Testing Deployment ✅

### Test Backend
- [ ] Open: `<backend-url>/api/users`
- [ ] Should see JSON response (might be empty array)
- [ ] Status should be 200 OK

### Test AI Service
- [ ] Open: `<ai-service-url>/docs`
- [ ] Should see FastAPI documentation page

### Test Frontend
- [ ] Open: `<frontend-url>`
- [ ] Homepage should load
- [ ] Try signing up for a new account
- [ ] Try logging in
- [ ] Browse courses
- [ ] Check if API calls work (check browser console for errors)

---

## Common Issues & Fixes 🔧

### ❌ Backend: "Cannot connect to MongoDB"
- [ ] Check MongoDB Atlas Network Access includes `0.0.0.0/0`
- [ ] Verify `MONGO_URI` is correct in environment variables
- [ ] Check Render logs for exact error

### ❌ Frontend: "Network Error" or "Cannot connect to backend"
- [ ] Verify `VITE_API_URL` is set correctly in frontend env vars
- [ ] Check backend is running (green dot in Render dashboard)
- [ ] Open browser console and check exact error
- [ ] Try backend URL directly in browser

### ❌ Backend: "CORS policy" error
- [ ] Make sure `FRONTEND_URL` is added to backend env vars
- [ ] Restart backend service after adding the variable
- [ ] Check frontend URL is exactly correct (no trailing slash)

### ❌ Build Failed
- [ ] Check Root Directory is set correctly
- [ ] Verify build command matches package.json scripts
- [ ] Check Render build logs for specific error
- [ ] Make sure all dependencies are in package.json

### ❌ Environment variables not working
- [ ] After adding env vars, service must restart
- [ ] Check variable names are exactly correct
- [ ] For frontend: Variables must start with `VITE_`

---

## Post-Deployment 🎉

### Monitor Your Services
- [ ] Check all three services show green status
- [ ] Set up [UptimeRobot](https://uptimerobot.com/) for monitoring
- [ ] Review logs regularly for errors

### Performance
- [ ] Test from different locations/devices
- [ ] Check page load times
- [ ] Monitor backend response times

### Security
- [ ] Never commit `.env` files to git
- [ ] Keep Razorpay keys secure
- [ ] Review MongoDB security settings
- [ ] Set up Razorpay webhook URLs (if needed)

### Optional Improvements
- [ ] Add custom domain to frontend
- [ ] Set up SSL certificate (Render does this automatically)
- [ ] Configure auto-deploy on git push
- [ ] Set up Slack/Discord notifications for deploy status

---

## 📊 Service URLs Reference

Once deployed, save these URLs:

- **Backend**: ___________________________________
- **AI Service**: ___________________________________
- **Frontend**: ___________________________________
- **MongoDB**: ___________________________________

---

## 🎓 Learning Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

## 📞 Getting Help

If you encounter issues:

1. Check Render service logs (very detailed)
2. Review `DEPLOYMENT_GUIDE.md` for detailed explanations
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

---

**Estimated Total Time**: 15-20 minutes

**Cost**: $0 (All on free tier)

**Status**: Ready to deploy! ✅
