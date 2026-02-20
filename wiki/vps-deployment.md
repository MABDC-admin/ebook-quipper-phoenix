# VPS + Cloudflare Tunnel Deployment

This guide explains how to host the eBook Portal on a private VPS (Virtual Private Server) while keeping the database on Railway and using Cloudflare Tunnels for secure access.

## Why this approach?
- **Full Control**: You manage the Node.js environment directly.
- **Simplified Networking**: Cloudflare Tunnels bypass complex firewall/NAT configurations.
- **Persistence**: Long-running processes are more stable for database connection pooling than serverless functions.

## Step 1: VPS Prerequisites
Install Node.js (v20+) and Git on your VPS:
```bash
# Example for Ubuntu
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

## Step 2: Clone and Setup
1. Clone your repository:
   ```bash
   git clone https://github.com/your-username/ebook-quipper-phoenix.git
   cd ebook-quipper-phoenix
   ```
2. Create your `.env` file with your Railway database details and secrets.

## Step 3: Cloudflare Tunnel Setup
1. Install `cloudflared` on the VPS.
2. Create a tunnel:
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create classroom-portal
   ```
3. Route the tunnel to a domain and local port:
   ```bash
   # Point your domain to the tunnel
   cloudflared tunnel route dns classroom-portal portal.yourdomain.com
   
   # Run the tunnel (points to the Next.js port)
   cloudflared tunnel run --url http://localhost:3000 classroom-portal
   ```

## Step 4: Configure NextAuth
Crucially, your `.env` on the VPS must point to your Cloudflare URL:
- `NEXTAUTH_URL=https://portal.yourdomain.com`

## Step 5: Run the App
- **Development (for testing)**: `npm run dev`
- **Production (recommended)**: 
  ```bash
  npm run build
  npm run start
  ```

> [!TIP]
> Use a process manager like **PM2** to keep the app running in the background:
> `pm2 start npm --name "classroom-viewer" -- run start`
