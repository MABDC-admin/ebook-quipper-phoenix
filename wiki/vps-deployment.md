# VPS + Cloudflare Tunnel Deployment

This guide explains how to host the eBook Portal on a private VPS (Virtual Private Server) while keeping the database local and using Cloudflare Tunnels for secure access.

## Why this approach?
- **Full Control**: You manage the Node.js environment directly.
- **Simplified Networking**: Cloudflare Tunnels bypass complex firewall/NAT configurations.
- **Persistence**: Long-running processes are more stable for database connection pooling than serverless functions.

## Step 1: System Update & Node.js 22 Installation
Ubuntu 24.04 works best with Node.js 20 or 22.

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git postgresql postgresql-contrib
```

## Step 2: Local PostgreSQL Configuration
Set up your local database and user:

```bash
# Switch to postgres user
sudo -i -u postgres

# Create database and user
psql -c "CREATE DATABASE ebook_db;"
psql -c "CREATE USER ebook_db WITH PASSWORD 'Denskie123';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE ebook_db TO ebook_db;"
# In Postgres 15+, you also need to grant schema permissions:
psql -d ebook_db -c "GRANT ALL ON SCHEMA public TO ebook_db;"

exit
```

## Step 3: Local Environment Variables
Your `.env` file on the VPS should now look like this:

```bash
DATABASE_URL="postgresql://ebook_db:Denskie123@localhost:5432/ebook_db"
NEXTAUTH_SECRET="7d488e3648f58319a9d24959db62e6e3"
NEXTAUTH_URL="https://your-domain.com"
AUTH_URL="https://your-domain.com"
```

## Step 4: Database Initialization
Run the migration and seed scripts on the VPS:

```bash
# From your app directory
node prisma/migrate.js
node prisma/seed.js
```

## Step 5: Install PM2 & Start
```bash
sudo npm install -g pm2
pm2 start npm --name "ebook-portal" -- run start
```

> [!TIP]
> Use a process manager like **PM2** to keep the app running in the background:
> `pm2 start npm --name "classroom-viewer" -- run start`
