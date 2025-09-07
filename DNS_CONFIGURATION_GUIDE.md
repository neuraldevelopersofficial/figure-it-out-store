# DNS Configuration Guide for Figure It Out Store

## Problem Identified

The error messages you're seeing (`net::ERR_NAME_NOT_RESOLVED` for `api.figureitoutstore.in`) indicate that your domain's DNS configuration is not properly set up. The browser cannot resolve the domain name to an IP address.

## Current Issues

1. The A record for the `api` subdomain in your GoDaddy DNS settings has configuration issues:
   - It contains two IP addresses (216.24.57.1 and 216.198.79.1)
   - You need to determine which IP address is correct for your backend deployment
   - Your Vercel configuration shows @ (root domain) instead of api subdomain

## Solution

### 1. Determine Your Deployment Architecture

First, clarify your deployment setup:
- **Backend (API)**: Should be deployed on Render with custom domain `api.figureitoutstore.in`
- **Frontend**: Should be deployed on Vercel with domain `figureitoutstore.in`

### 2. Update DNS Records in GoDaddy

**For the API subdomain (backend on Render):**
1. Remove the current A records for the `api` subdomain
2. Add a new A record:
   - **Type**: A
   - **Name**: api
   - **Value**: [Get this from your Render dashboard - it should be the IP address of your deployed backend service]
   - **TTL**: 1 Hour

**For the root domain (frontend on Vercel):**
1. Update the @ record:
   - **Type**: A
   - **Name**: @
   - **Value**: 76.76.21.21 (Vercel's recommended IP)
   - **TTL**: 1 Hour

### 2. Verify Your Render Deployment

Make sure your backend is properly deployed on Render:

1. Log into your Render account
2. Check that your backend service is running without errors
3. Verify the custom domain is configured correctly in Render settings

### 3. DNS Propagation

After updating your DNS settings, it may take some time (usually between 15 minutes to 48 hours) for the changes to propagate across the internet. During this time, some users might still experience the error.

## Testing Your Configuration

After making these changes and waiting for DNS propagation, you can test your configuration using:

1. Browser: Try accessing your site and API endpoints
2. Command line: Use `ping api.figureitoutstore.in` to check if it resolves to the correct IP
3. Online tools: Use DNS lookup tools like [dnschecker.org](https://dnschecker.org) to verify your DNS settings

## Additional Notes

- If you're using Vercel for both frontend and backend, make sure your environment variables are correctly set in both places
- The `VITE_API_URL` in your Vercel configuration is correctly set to `https://api.figureitoutstore.in/api`
- Make sure your backend is configured to accept requests from your frontend domain

## Need More Help?

If you continue to experience issues after following these steps, you may need to:

1. Contact GoDaddy support to ensure there are no issues with your domain registration
2. Check with Render support to verify your backend deployment is correctly configured
3. Verify that your backend server is running and accessible