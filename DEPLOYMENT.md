# Deployment Guide for Design Match Vision (Free Tier)

This guide will help you deploy your Design Match Vision application on Render's **free tier**.

## Prerequisites

- A Render account (free tier)
- Your code pushed to a Git repository (GitHub, GitLab, etc.)

## Free Tier Limitations

⚠️ **Important**: Render's free tier has specific limitations that affect this application:

- **Service Sleep**: Services sleep after 15 minutes of inactivity
- **Limited Resources**: 512MB RAM, shared CPU
- **Build Time**: 15-minute build timeout
- **Bandwidth**: 100GB/month
- **Puppeteer Challenges**: Limited memory for browser automation

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Push your code to Git repository**
   Make sure your code is pushed to a Git repository with the `render.yaml` file in the root.

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Sign up/Login with your Git account
   - Click "New +" and select "Blueprint"

3. **Deploy from Blueprint**
   - Select your repository
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to deploy both services

### Option 2: Manual Deployment

#### Deploy Backend First

1. **Create Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your Git repository

2. **Configure Backend Service**
   - **Name**: `design-match-vision-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: **Free** (not Starter)

3. **Environment Variables**
   - `NODE_ENV`: `production`
   - `PORT`: `10000`

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the service URL (e.g., `https://design-match-vision-backend.onrender.com`)

#### Deploy Frontend

1. **Create Static Site**
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your Git repository

2. **Configure Frontend Service**
   - **Name**: `design-match-vision-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

3. **Environment Variables**
   - `VITE_API_URL`: `https://your-backend-service-url.onrender.com` (replace with your actual backend URL)

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=10000
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-service-url.onrender.com
```

## Free Tier Optimizations

The application has been optimized for Render's free tier:

### Backend Optimizations
- **Memory Usage**: Limited to 512MB with `--max_old_space_size=512`
- **Puppeteer**: Optimized browser flags for limited resources
- **Timeouts**: Reduced timeouts to work within free tier limits
- **Resource Blocking**: Blocks unnecessary resources (images, CSS, fonts) during screenshots
- **Retry Logic**: Reduced retry attempts to save resources

### Frontend Optimizations
- **Build Size**: Optimized Vite build for faster deployment
- **Environment Variables**: Automatic API URL configuration

## Important Notes for Free Tier

### 1. **Service Sleep**
- Your backend will sleep after 15 minutes of inactivity
- First request after sleep may take 30-60 seconds to wake up
- Consider using a service like UptimeRobot to ping your health endpoint

### 2. **Puppeteer Limitations**
- Limited memory may cause screenshot failures on complex pages
- Some websites may not load properly due to resource blocking
- Screenshots may be slower than on paid plans

### 3. **Performance Expectations**
- Initial deployment: 5-10 minutes
- Service wake-up: 30-60 seconds after sleep
- Screenshot processing: 10-30 seconds (depending on page complexity)

### 4. **Recommended Usage**
- Test with simple, lightweight pages first
- Avoid very large or complex websites
- Use during active development/testing periods

## Troubleshooting Free Tier Issues

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version is compatible (>=18.0.0)
   - Build timeout: Ensure build completes within 15 minutes

2. **Puppeteer Issues on Free Tier**
   - **Memory Errors**: Try simpler pages or reduce viewport size
   - **Timeout Errors**: Increase wait times in the frontend
   - **Browser Crashes**: Service may need to be restarted

3. **Service Sleep Issues**
   - First request after sleep may fail
   - Wait 30-60 seconds and try again
   - Use health check endpoint: `https://your-backend-url.onrender.com/health`

4. **CORS Errors**
   - Ensure the backend CORS configuration allows your frontend domain
   - Check that the `VITE_API_URL` environment variable is set correctly

### Performance Monitoring

1. **Check Service Status**
   - Monitor Render dashboard for service health
   - Check logs for memory usage and errors

2. **Health Check**
   - Test: `https://your-backend-url.onrender.com/health`
   - Should return: `{"status":"OK","message":"Figma-to-Code comparison server is running"}`

3. **Memory Usage**
   - Monitor logs for memory warnings
   - Restart service if memory usage is consistently high

## Upgrading from Free Tier

When you're ready to upgrade:

1. **Starter Plan ($7/month)**
   - 512MB RAM, dedicated CPU
   - No sleep, always running
   - Better Puppeteer performance

2. **Standard Plan ($25/month)**
   - 1GB RAM, dedicated CPU
   - Production-ready performance
   - Full Puppeteer capabilities

## Support

If you encounter issues:
1. Check Render logs in the dashboard
2. Verify environment variables are set correctly
3. Test the backend health endpoint: `https://your-backend-url.onrender.com/health`
4. Consider the free tier limitations mentioned above

## Cost Considerations

- **Free Tier**: $0/month (with limitations)
- **Starter Plan**: $7/month per service, better performance
- **Standard Plan**: $25/month per service, production-ready

For production use or heavy usage, consider upgrading to at least the Starter plan for better reliability and performance. 