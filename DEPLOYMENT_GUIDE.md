# 🚀 LearnGenie Deployment Guide

## ✅ Your Project is Now Ready for Deployment!

All code has been updated to work seamlessly in both local development and production environments.

---

## 📋 What Was Changed

### ✅ Backend (`BACKEND/`)
- Updated CORS configuration to accept dynamic frontend URLs
- Now accepts requests from `onrender.com`, `vercel.app`, and `netlify.app` domains
- Uses `FRONTEND_URL` environment variable for production

### ✅ Frontend (`FRONTEND/`)
- Created centralized API configuration (`src/config/api.js`)
- Updated **ALL** 34+ hardcoded `localhost` URLs across:
  - ✅ Signup.jsx
  - ✅ SignIn.jsx
  - ✅ LearnerHome.jsx
  - ✅ CourseMan.jsx
  - ✅ Admin_Dashboard.jsx
  - ✅ Explore.jsx
  - ✅ Contact.jsx
- All components now use environment variables with localhost fallbacks

### ✅ Configuration Files
- Created `.env.example` files for Backend, Frontend, and FastAPI
- Created `render.yaml` for one-click Render deployment
- Created `vercel.json` for Vercel deployment

---

## 🎯 Deployment Options

### Option 1: Render (Recommended - FREE)

#### Step 1: Deploy Backend

1. Go to [render.com](https://render.com) and sign in
2. Click **New** → **Web Service**
3. Connect your GitHub repository: `Aswanth-jpg/Learn-Genie`
4. Configure:
   - **Name**: `learngenie-backend`
   - **Root Directory**: `BACKEND`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables:
   ```
   MONGO_URI=mongodb+srv://aswanthmurali2002:xaFv6VJlIdLfZYdA@ocs.eermj7b.mongodb.net/test?retryWrites=true&w=majority&appName=OCS
   PORT=5000
   NODE_ENV=production
   RAZORPAY_KEY_ID=rzp_test_cPgHUgWSWMKu71
   RAZORPAY_KEY_SECRET=your_secret_key_here
   ```

6. Click **Create Web Service**
7. **Copy the deployed URL** (e.g., `https://learngenie-backend.onrender.com`)

#### Step 2: Deploy FastAPI

1. Click **New** → **Web Service**
2. Connect same repository
3. Configure:
   - **Name**: `learngenie-ai`
   - **Root Directory**: `FAST_API`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn recommendation_api:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free

4. Click **Create Web Service**
5. **Copy the deployed URL** (e.g., `https://learngenie-ai.onrender.com`)

#### Step 3: Deploy Frontend

1. Click **New** → **Static Site**
2. Connect same repository
3. Configure:
   - **Name**: `learngenie-frontend`
   - **Root Directory**: `FRONTEND`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Add Environment Variables (use URLs from Steps 1 & 2):
   ```
   VITE_API_URL=https://learngenie-backend.onrender.com
   VITE_AI_URL=https://learngenie-ai.onrender.com
   VITE_RAZORPAY_KEY_ID=rzp_test_cPgHUgWSWMKu71
   ```

5. Click **Create Static Site**
6. **Copy the deployed URL** (e.g., `https://learngenie-frontend.onrender.com`)

#### Step 4: Update Backend with Frontend URL

1. Go back to your Backend service
2. Go to **Environment** tab
3. Add new environment variable:
   ```
   FRONTEND_URL=https://learngenie-frontend.onrender.com
   ```
4. Click **Save Changes** (service will auto-redeploy)

---

### Option 2: Mixed Deployment

You can mix and match platforms:

#### Frontend on Vercel:
```bash
cd FRONTEND
npm i -g vercel
vercel
# Follow prompts and add environment variables
```

#### Backend on Railway:
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select `BACKEND` folder
4. Add environment variables

---

## 🔐 MongoDB Atlas Setup

⚠️ **Important**: Whitelist Render's IPs for database access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your cluster → Network Access
3. Click **Add IP Address**
4. Add: `0.0.0.0/0` (allows all IPs - needed for Render)
5. Click **Confirm**

---

## 🧪 Test Locally First

### Test with Environment Variables:

1. **Backend**:
```bash
cd BACKEND
cp .env.example .env
# Edit .env with your values
npm start
```

2. **Frontend**:
```bash
cd FRONTEND
cp .env.example .env.local
# Edit .env.local with your values (or leave default for localhost)
npm run dev
```

3. **FastAPI**:
```bash
cd FAST_API
pip install -r requirements.txt
uvicorn recommendation_api:app --reload
```

### Test with Default Localhost:

Your app still works without any `.env` files thanks to fallback values!

```bash
# Backend
cd BACKEND
npm start

# Frontend (in another terminal)
cd FRONTEND
npm run dev
```

---

## 📊 Deployment Checklist

Before deploying, make sure:

- [x] ✅ Code updated to use environment variables
- [x] ✅ CORS configured for production domains
- [x] ✅ `.env.example` files created
- [ ] ⏳ MongoDB Atlas network access set to `0.0.0.0/0`
- [ ] ⏳ Razorpay secret key ready
- [ ] ⏳ GitHub repository up to date (push latest changes)
- [ ] ⏳ Backend deployed and URL noted
- [ ] ⏳ FastAPI deployed and URL noted
- [ ] ⏳ Frontend environment variables set with backend URLs
- [ ] ⏳ Frontend deployed
- [ ] ⏳ Backend updated with frontend URL

---

## 🐛 Troubleshooting

### Issue: CORS errors
**Solution**: Make sure `FRONTEND_URL` is set in backend environment variables

### Issue: "Cannot connect to database"
**Solution**: Check MongoDB Atlas Network Access allows `0.0.0.0/0`

### Issue: Environment variables not working
**Solution**: 
- For Render: Restart the service after adding env vars
- For local: Make sure `.env` file exists and `npm run dev` is restarted

### Issue: Build fails on Render
**Solution**: Check that:
- Root Directory is set correctly
- Build command matches package.json scripts
- All dependencies are in package.json

### Issue: Frontend shows "Network Error"
**Solution**: 
- Check backend is running and accessible
- Verify `VITE_API_URL` is set correctly
- Check browser console for exact error

---

## 🎉 Post-Deployment

After successful deployment:

1. **Test all features**:
   - ✓ User signup/login
   - ✓ Browse courses
   - ✓ Course enrollment
   - ✓ Payment (test mode)
   - ✓ Profile updates

2. **Monitor services**:
   - Check Render dashboard for logs
   - Set up uptime monitoring

3. **Security**:
   - Switch from Razorpay test keys to live keys when ready
   - Consider adding rate limiting
   - Review MongoDB security rules

---

## 📞 Need Help?

Common deployment errors and solutions:

1. **"Module not found"** → Run `npm install` locally and push `package-lock.json`
2. **"Port already in use"** → Render assigns ports automatically, don't hardcode
3. **"CORS policy"** → Already handled! Just set `FRONTEND_URL` environment variable

---

## 🚀 Quick Deploy Summary

```bash
# 1. Push latest code to GitHub
git add .
git commit -m "Prepared for deployment"
git push

# 2. Deploy on Render:
- Backend: New Web Service → BACKEND folder
- AI Service: New Web Service → FAST_API folder  
- Frontend: New Static Site → FRONTEND folder

# 3. Set environment variables in Render dashboard

# 4. Done! 🎉
```

---

**Your project is production-ready!** 🚀

All localhost references have been replaced with environment variables while maintaining local development functionality.
