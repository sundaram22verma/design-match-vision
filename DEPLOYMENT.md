# Deployment Guide for Design Match Vision

This guide will help you deploy your Design Match Vision application on Render.

## Prerequisites

- A Render account (free tier available)
- Your code pushed to a Git repository (GitHub, GitLab, etc.)

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
   - **Plan**: Starter (Free)

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

## Important Notes

1. **Puppeteer on Render**: The backend uses Puppeteer for taking screenshots. Render's free tier has limitations:
   - Services may sleep after 15 minutes of inactivity
   - Limited memory and CPU resources
   - Consider upgrading to a paid plan for production use

2. **CORS Configuration**: The backend is configured to accept requests from any origin. For production, you should restrict this to your frontend domain.

3. **File Storage**: Images are stored temporarily in the `assets` directory. For production, consider using cloud storage (AWS S3, Cloudinary, etc.).

4. **Health Check**: The backend includes a `/health` endpoint for monitoring.

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure Node.js version is compatible (>=18.0.0)

2. **Puppeteer Issues**
   - Render may require additional dependencies for Puppeteer
   - Consider using `puppeteer-core` with a browser-as-a-service

3. **CORS Errors**
   - Ensure the backend CORS configuration allows your frontend domain
   - Check that the `VITE_API_URL` environment variable is set correctly

4. **Image Loading Issues**
   - Verify that the backend service is running
   - Check that image paths are correct in the response

### Support

If you encounter issues:
1. Check Render logs in the dashboard
2. Verify environment variables are set correctly
3. Test the backend health endpoint: `https://your-backend-url.onrender.com/health`

## Cost Considerations

- **Free Tier**: Limited resources, services may sleep
- **Starter Plan**: $7/month per service, better performance
- **Standard Plan**: $25/month per service, production-ready

For production use, consider upgrading to at least the Starter plan for better reliability and performance. 