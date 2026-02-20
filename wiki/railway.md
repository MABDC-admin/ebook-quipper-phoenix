# Railway Deployment Guide

This project is optimized for deployment on **Railway**. Using Railway for both the database and the application provides a unified environment and avoids common serverless pitfalls.

## Deployment Steps

1. **Create a New Project**: On Railway, create a new project from your GitHub repository.
2. **Configure Variables**: Copy all variables from your local `.env` to the Railway **Variables** tab:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `AUTH_SECRET` (Use the same as `NEXTAUTH_SECRET`)
   - `NEXTAUTH_URL` (Set this to your Railway app URL, e.g., `https://your-app.up.railway.app`)
3. **Build Configuration**: Railway will automatically detect the `railway.json` and `package.json`. It will use **Nixpacks** to build the Next.js app.
4. **Deploy**: Once the variables are set, trigger a redeploy.

## Why Railway?

- **Persistent Connections**: Unlike Vercel's serverless functions, Railway apps run as long-lived processes, which helps keep the PostgreSQL connection pool warm and stable.
- **Unified Network**: If your database is also on Railway, latency will be extremely low.
- **Port Management**: Railway automatically assigns a port, which the Next.js `start` script handles out of the box.
