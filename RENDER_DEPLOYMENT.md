# Render Deployment Guide

## Overview

This guide explains how to deploy the Figure It Out Store application on Render.com.

## Files Added for Render Deployment

1. **render.yaml** - Configuration file for Render deployment
2. **server.js** - Express server to serve the static files
3. **Procfile** - Specifies the command to start the application

## Deployment Steps

1. **Push your code to GitHub**

2. **Connect to Render**
   - Go to [render.com](https://render.com)
   - Sign up or log in
   - Click "New" and select "Blueprint"
   - Connect your GitHub repository

3. **Render will automatically**:
   - Detect the render.yaml file
   - Set up the service as specified
   - Build and deploy your application

4. **Environment Variables**
   - The NODE_ENV variable is set to "production" in render.yaml
   - Add any additional environment variables in the Render dashboard

## Troubleshooting

If you encounter the "ENOENT: no such file or directory, stat '/opt/render/project/src/dist/index.html'" error:

1. Make sure the build process completes successfully
2. Check that the dist directory is created
3. Verify that server.js is correctly serving files from the dist directory
4. Check the Render logs for any build or runtime errors

## Local Testing

To test the production build locally:

```bash
npm run build
node server.js
```

Then visit http://localhost:10000 in your browser.