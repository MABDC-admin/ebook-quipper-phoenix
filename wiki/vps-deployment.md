# VPS + Cloudflare Tunnel Deployment

This guide explains how to host the eBook Portal on a private VPS (Virtual Private Server) while keeping the database on Railway and using Cloudflare Tunnels for secure access.

## Why this approach?
- **Full Control**: You manage the Node.js environment directly.
- **Simplified Networking**: Cloudflare Tunnels bypass complex firewall/NAT configurations.
- **Persistence**: Long-running processes are more stable for database connection pooling than serverless functions.

## Step 1: System Update & Node.js 22 Installation
Ubuntu 24.04 works best with Node.js 20 or 22. Here is the safest way to install it:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 22 (Current LTS recommendation)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Verify versions
node -v # Should be v22.x.x
npm -v
```

## Step 2: Install Process Manager (PM2)
To keep your app running even after you close the terminal:
```bash
sudo npm install -g pm2
```
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
