# Project Wiki

Welcome to the **eBook Portal** developer documentation. This wiki provides a comprehensive overview of the project's architecture, technologies, and implementation details.

## Quick Links

- [🗄️ Database Architecture](database.md) - Details on PostgreSQL schema and connection pooling.
- [🔐 Authentication System](authentication.md) - Explanation of NextAuth and raw SQL integration.
- [📡 API Reference](api-reference.md) - Documentation for all REST API endpoints.
- [⚛️ Frontend Architecture](frontend-architecture.md) - Overview of the Next.js App Router and UI components.
- [🚀 Railway Deployment](railway.md) - Guide for deploying the app to Railway.
- [☁️ VPS Deployment](vps-deployment.md) - Guide for VPS + Cloudflare Tunnels.

## Technology Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Database**: [PostgreSQL (Railway Hosted)](https://railway.app/)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/)
- **Styling**: [Vanilla CSS / Tailwind CSS 4](https://tailwindcss.com/)
- **Client Components**: `react-pageflip`, `jszip`, `pdfjs-dist`

## Getting Started

1. Clone the repository.
2. Follow the [Database Setup Guide](../DATABASE_SETUP.md) to initialize your environment.
3. Run `npm install` and `npm run dev`.
