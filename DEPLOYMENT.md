# Deployment Guide for LearnGenie

This guide provides step-by-step instructions for deploying the LearnGenie application to Render.

## Architecture Overview

LearnGenie consists of three main services:
1. **Frontend** - React application (Vite)
2. **Backend** - Node.js/Express API server
3. **FastAPI** - Python-based recommendation service

## Prerequisites

- A [Render](https://render.com/) account
- GitHub repository with your code
- MongoDB Atlas account and connection string
- All environment variables ready

---

## Part 1: Deploy the Backend (Node.js/Express)

### Step 1: Create a New Web Service

1. Log in to your Render dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository containing your LearnGenie project

### Step 2: Configure the Backend Service

Use the following settings:

- **Name**: `learngenie-backend` (or your preferred name)
- **Region**: Choose the closest to your users
- **Branch**: `main` (or your default branch)
- **Root Directory**: `BACKEND`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node app.js`
- **Instance Type**: `Free` (or select a paid plan as needed)

### Step 3: Set Environment Variables

Add the following environment variables in the Render dashboard:

| Key | Value | Description |
|-----|-------|-------------|
| `MONGO_URI` | `your-mongodb-connection-string` | MongoDB Atlas connection string |
| `PORT` | `5000` | Port for the backend server (Render will override with its own) |
| `NODE_ENV` | `production` | Environment mode |

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for the deployment to complete
3. Note the service URL (e.g., `https://learngenie-backend.onrender.com`)

---

## Part 2: Deploy the FastAPI Service

### Step 1: Create a New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect the same GitHub repository

### Step 2: Configure the FastAPI Service

Use the following settings:

- **Name**: `learngenie-fastapi` (or your preferred name)
- **Region**: Choose the closest to your users
- **Branch**: `main`
- **Root Directory**: `FAST_API`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Instance Type**: `Free` (or select a paid plan as needed)

### Step 3: Set Environment Variables

Add the following environment variables:

| Key | Value | Description |
|-----|-------|-------------|
| `PYTHON_VERSION` | `3.11.0` | Python version (adjust as needed) |

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait for the deployment to complete
3. Note the service URL (e.g., `https://learngenie-fastapi.onrender.com`)

---

## Part 3: Deploy the Frontend (React/Vite)

### Step 1: Update Environment Variables

1. In your local repository, open `FRONTEND/.env.production`
2. Update the `VITE_API_BASE_URL` with your backend URL from Part 1:
   ```
   VITE_API_BASE_URL=https://learngenie-backend.onrender.com
   ```
3. Commit and push this change to GitHub

### Step 2: Create a Static Site

1. Click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository

### Step 3: Configure the Frontend Service

Use the following settings:

- **Name**: `learngenie-frontend` (or your preferred name)
- **Region**: Choose the closest to your users
- **Branch**: `main`
- **Root Directory**: `FRONTEND`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### Step 4: Set Environment Variables

Add the following environment variable:

| Key | Value | Description |
|-----|-------|-------------|
| `VITE_API_BASE_URL` | `https://learngenie-backend.onrender.com` | Your backend URL from Part 1 |

### Step 5: Deploy

1. Click **"Create Static Site"**
2. Wait for the deployment to complete
3. Note the site URL (e.g., `https://learngenie-frontend.onrender.com`)

---

## Part 4: Update CORS Configuration

### Step 1: Update Backend CORS Settings

1. In your local repository, open `BACKEND/app.js`
2. Find the CORS configuration (around line 34):
   ```javascript
   app.use(cors({
       origin: [
           'http://localhost:3000', 
           'http://localhost:5173', 
           'http://localhost:4173',
           'https://your-frontend-app.onrender.com' // Replace this
       ],
       credentials: true
   }));
   ```
3. Replace `https://your-frontend-app.onrender.com` with your actual frontend URL from Part 3
4. Commit and push this change to GitHub
5. The backend service on Render will automatically redeploy

---

## Part 5: Verification and Testing

### Step 1: Test Each Service

1. **Backend API**: Visit `https://learngenie-backend.onrender.com/api/courses`
   - Should return JSON data or an empty array
   
2. **FastAPI**: Visit `https://learngenie-fastapi.onrender.com/docs`
   - Should display the FastAPI Swagger documentation

3. **Frontend**: Visit `https://learngenie-frontend.onrender.com`
   - Should display the LearnGenie home page

### Step 2: Test Full Flow

1. Navigate to the frontend URL
2. Try signing up for a new account
3. Log in with the new account
4. Browse courses
5. Check if all features work correctly

---

## Troubleshooting

### Issue: Frontend can't connect to backend

**Solution**: 
- Verify that `VITE_API_BASE_URL` is set correctly in the frontend environment variables
- Check browser console for CORS errors
- Ensure the backend CORS configuration includes the frontend URL

### Issue: Backend database connection fails

**Solution**:
- Verify MongoDB Atlas connection string is correct
- Ensure MongoDB Atlas allows connections from any IP (0.0.0.0/0) or add Render's IP ranges
- Check the backend logs in Render dashboard

### Issue: Services go to sleep (Free tier)

**Solution**:
- Free tier services on Render sleep after 15 minutes of inactivity
- Upgrade to a paid plan for always-on services
- Consider using a service like UptimeRobot to ping your services periodically

### Issue: Build fails

**Solution**:
- Check the build logs in Render dashboard
- Ensure all dependencies are listed in `package.json` or `requirements.txt`
- Verify the Build Command is correct

---

## Environment Variables Summary

### Backend Service
- `MONGO_URI`: MongoDB connection string
- `PORT`: 5000 (optional, Render provides its own)
- `NODE_ENV`: production

### FastAPI Service
- `PYTHON_VERSION`: 3.11.0

### Frontend Static Site
- `VITE_API_BASE_URL`: Your backend service URL

---

## Automatic Deployments

Render automatically deploys your services when you push to the connected branch. To disable auto-deploy:

1. Go to your service settings in Render
2. Scroll to "Auto-Deploy"
3. Toggle it off

To manually deploy:
1. Go to your service in Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

---

## Monitoring and Logs

### View Logs
1. Go to your service in Render dashboard
2. Click on "Logs" tab
3. View real-time logs or filter by time range

### Monitor Performance
- Render provides basic metrics on the dashboard
- For advanced monitoring, consider integrating tools like:
  - Sentry (error tracking)
  - LogRocket (session replay)
  - New Relic (performance monitoring)

---

## Updating API Endpoints

If you need to change the backend URL in the future:

1. Update `FRONTEND/.env.production` with the new URL
2. Update the `VITE_API_BASE_URL` environment variable in Render frontend settings
3. Redeploy the frontend (automatic or manual)
4. Update CORS settings in `BACKEND/app.js` if needed
5. Redeploy the backend

---

## Cost Optimization Tips

1. **Use a single database**: Share MongoDB Atlas across all environments
2. **Optimize images**: Use WebP format and lazy loading
3. **Enable caching**: Configure proper cache headers
4. **Monitor usage**: Regularly check Render dashboard for resource usage
5. **Consider upgrading strategically**: Only upgrade services that need more resources

---

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **CORS**: Keep CORS origins as restrictive as possible
3. **MongoDB**: Whitelist specific IPs instead of allowing all (0.0.0.0/0)
4. **HTTPS**: Render provides SSL certificates automatically
5. **API Rate Limiting**: Consider implementing rate limiting for production

---

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Express CORS Documentation](https://expressjs.com/en/resources/middleware/cors.html)

---

## Support

If you encounter issues not covered in this guide:
1. Check Render's [status page](https://status.render.com/)
2. Review Render's [community forum](https://community.render.com/)
3. Contact Render support through the dashboard

---

**Last Updated**: December 2025
**Version**: 1.0
