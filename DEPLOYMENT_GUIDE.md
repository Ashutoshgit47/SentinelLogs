# Cosmic Timeline - Deployment Guide

Complete guide for running locally and deploying to free hosting platforms.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Prerequisites](#prerequisites)
3. [Backend Access Options](#backend-access-options)
4. [Local Development](#local-development)
5. [Environment Variables](#environment-variables)
6. [Deploy Frontend to Cloudflare Pages](#deploying-frontend-to-cloudflare-pages)
7. [Deploy Frontend to Vercel](#deploying-frontend-to-vercel)
8. [Deploy Frontend to Netlify](#deploying-frontend-to-netlify)
9. [Deploy Frontend to GitHub Pages](#deploying-frontend-to-github-pages)
10. [Deploy Backend to Render](#deploying-backend-to-render)
11. [Railway Deployment](#railway-deployment)
12. [Build Your Own Backend](#build-your-own-backend)
13. [Post-Deployment Checklist](#post-deployment-checklist)
14. [Troubleshooting](#troubleshooting)

---

## Project Structure

```
cosmic-timeline/
├── backend/                 # Node.js/Express API
│   ├── controllers/         # Route handlers
│   │   ├── apodController.js
│   │   ├── geocodeController.js
│   │   ├── onThisDayController.js
│   │   └── skyEventsController.js
│   ├── data/               # Static data (sky events)
│   ├── middleware/         # Rate limiting, error handling
│   ├── routes/             # API route definitions
│   │   ├── apod.js
│   │   ├── discoveries.js
│   │   ├── geocode.js
│   │   ├── history.js
│   │   └── skyEvents.js
│   ├── utils/              # Cache utility
│   ├── server.js           # Main entry point
│   ├── package.json
│   ├── .env.example        # Environment template
│   └── .env                # Your environment variables (DO NOT COMMIT)
│
├── frontend/               # Vite + Vanilla JS + Tailwind v4
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── APOD.js
│   │   │   ├── Discoveries.js
│   │   │   ├── History.js
│   │   │   ├── Navbar.js
│   │   │   └── SkyEvents.js
│   │   ├── utils/          # Helpers
│   │   │   ├── dateFormat.js
│   │   │   ├── location.js
│   │   │   └── timezone.js
│   │   ├── api.js          # API client
│   │   ├── config.js       # Configuration
│   │   ├── main.js         # Entry point
│   │   └── style.css       # Tailwind styles
│   ├── public/             # Static assets
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example            # Development environment template
│   ├── .env.production.example # Production environment template
│   └── .env                    # Your environment variables (DO NOT COMMIT)
│
├── DEPLOYMENT_GUIDE.md     # This file
└── README.md
```

---

## Prerequisites

### Required Software

| Software | Minimum Version | Check Command | Download |
|----------|----------------|---------------|----------|
| Node.js | v18.0.0+ | `node --version` | [nodejs.org](https://nodejs.org) |
| npm | v9.0.0+ | `npm --version` | Included with Node.js |
| Git | Any recent | `git --version` | [git-scm.com](https://git-scm.com) |

### Verify Installation

**Windows (PowerShell):**
```powershell
# Check all prerequisites
node --version; npm --version; git --version
```

**macOS/Linux (Terminal):**
```bash
# Check all prerequisites
node --version && npm --version && git --version
```

### NASA API Key (For Backend)

- Get a free API key at: https://api.nasa.gov
- `DEMO_KEY` works for testing (rate-limited to 30 requests/hour)
- Your own key allows up to 1000 requests/hour

---

## Backend Access Options

> **Important:** The frontend requires a backend API to function. You have two options:

### Option 1: Request Backend Access

Contact the developer to get access to the hosted backend:

🔗 **[Contact: Ashutosh on GitHub](https://github.com/Ashutoshgit47/Ashutoshgit47)**

Send a message requesting backend access, and you'll receive the backend URL to use with your frontend deployment.

### Option 2: Deploy Your Own Backend

See the [Build Your Own Backend](#build-your-own-backend) section for complete instructions on setting up your own backend server on Render or Railway.

---

## Local Development

> 🚨 **CRITICAL SETUP REQUIREMENT**  
> This project uses `.env.example` template files for configuration. You **MUST** copy or rename these files to `.env` (remove the `.example` suffix) in both `backend/` and `frontend/` folders for the project to work.  
> **Files to rename:**
> - `backend/.env.example` → `backend/.env`
> - `frontend/.env.example` → `frontend/.env`

### Step 1: Clone Repository

```bash
git clone https://github.com/Ashutoshgit47/Cosmic-Timeline.git
cd Cosmic-Timeline
```

### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install
```

### Step 3: Create Backend Environment File

> ⚠️ **IMPORTANT**: The project includes `.env.example` template files. You **MUST** rename or copy them to `.env` for the project to work.

**Windows (PowerShell):**
```powershell
# Copy .env.example to .env
Copy-Item .env.example .env
```

**macOS/Linux:**
```bash
# Copy .env.example to .env
cp .env.example .env
```

**Or manually:**
1. Find the file `backend/.env.example`
2. Copy it and rename the copy to `backend/.env`

### Step 4: Configure Backend Environment

Edit `backend/.env` file:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
NASA_API_KEY=DEMO_KEY
```

> **Note:** Replace `DEMO_KEY` with your own NASA API key for better rate limits.

### Step 5: Start Backend Server

```bash
# From the backend folder
npm start

# Or for development with auto-reload (Node.js 18+):
npm run dev
```

✅ Backend runs at: `http://localhost:3000`

**Verify backend is running:**
```bash
# Test health endpoint
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 5,
  "timestamp": "...",
  "version": "1.0.0",
  "cache": {
    "keys": 0,
    "hits": 0,
    "misses": 0,
    "hitRate": "0%"
  }
}
```

### Step 6: Setup Frontend (New Terminal)

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install
```

### Step 7: Create Frontend Environment File

> ⚠️ **IMPORTANT**: You **MUST** rename or copy `.env.example` to `.env` for the frontend to connect to the backend.

**Windows (PowerShell):**
```powershell
# Copy .env.example to .env
Copy-Item .env.example .env
```

**macOS/Linux:**
```bash
# Copy .env.example to .env
cp .env.example .env
```

**Or manually:**
1. Find the file `frontend/.env.example`
2. Copy it and rename the copy to `frontend/.env`

### Step 8: Configure Frontend Environment

Edit `frontend/.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

### Step 9: Start Frontend Development Server

```bash
# From the frontend folder
npm run dev
```

✅ Frontend runs at: `http://localhost:5173`

The browser should automatically open. If not, navigate to `http://localhost:5173`.

---

## Environment Variables

### Backend (backend/.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port (default: 3000) | `3000` |
| `NODE_ENV` | Yes | Environment mode | `development` or `production` |
| `FRONTEND_URL` | Yes | Allowed CORS origin | `https://your-app.vercel.app` |
| `CF_PAGES_URL` | No | Cloudflare Pages URL (auto-allowed) | `https://your-app.pages.dev` |
| `NASA_API_KEY` | No | NASA API key | `your_api_key_here` |
| `RATE_LIMIT_WHITELIST` | No | IPs to skip rate limiting | `127.0.0.1,::1` |
| `NOMINATIM_USER_AGENT` | No | User-Agent for geocoding | `CosmicTimeline/1.0` |

### Frontend (frontend/.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend API URL | `https://your-backend.onrender.com/api` |

> **Important:** Never commit `.env` files to version control. Use `.env.example` as templates.

---

## Deploying Frontend to Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) - Unlimited bandwidth, fast global CDN, free tier

### Step 1: Create Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up for a free account

### Step 2: Connect to Git

1. In the Cloudflare dashboard, go to **Workers & Pages**
2. Click **Create application** → **Pages** → **Connect to Git**
3. Connect your GitHub/GitLab account
4. Select your repository

### Step 3: Configure Build Settings

| Setting | Value |
|---------|-------|
| **Project name** | `cosmic-timeline` |
| **Production branch** | `main` |
| **Framework preset** | `Vite` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `frontend` |

### Step 4: Add Environment Variable

1. Expand **Environment variables** section
2. Add:

| Variable name | Value |
|---------------|-------|
| `VITE_API_URL` | `https://your-backend-url.com/api` |

> Replace with the backend URL you received or your own deployed backend URL.

### Step 5: Deploy

Click **Save and Deploy**

Your site will be available at: `https://cosmic-timeline.pages.dev`

### Step 6: Update Backend CORS

Add your Cloudflare Pages URL to the backend's `FRONTEND_URL` or `CF_PAGES_URL` environment variable for CORS.

---

## Deploying Frontend to Vercel

[Vercel.com](https://vercel.com) - Generous free tier with unlimited deployments

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Project Name** | `cosmic-timeline` |
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### Step 3: Add Environment Variable

Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend-url.com/api` |

### Step 4: Deploy

Click **"Deploy"**

Your URL: `https://cosmic-timeline.vercel.app`

### Step 5: Update Backend CORS

Update the backend's `FRONTEND_URL` environment variable with your Vercel URL.

---

## Deploying Frontend to Netlify

[Netlify.com](https://netlify.com) - 100GB bandwidth/month free

### Step 1: Create netlify.toml

Create `frontend/netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 2: Deploy

**Option A: Connect GitHub**
1. Go to https://netlify.com
2. New site from Git → Connect repository
3. Set build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

**Option B: Manual Deploy**
```bash
cd frontend
npm run build
# Drag & drop the 'dist' folder to Netlify
```

### Step 3: Add Environment Variable

Site settings → Environment variables:

```
VITE_API_URL=https://your-backend-url.com/api
```

Trigger a redeploy after adding the variable.

---

## Deploying Frontend to GitHub Pages

### Step 1: Update vite.config.js

Edit `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Cosmic-Timeline/', // Your repo name
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  },
  server: {
    port: 5173,
    open: true
  },
  preview: {
    port: 4173
  }
})
```

### Step 2: Install gh-pages

```bash
cd frontend
npm install -D gh-pages
```

### Step 3: Add Deploy Script

Update `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

### Step 4: Set Environment Variable

Copy `frontend/.env.production.example` to `frontend/.env.production`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.production.example .env.production
```

**macOS/Linux:**
```bash
cp .env.production.example .env.production
```

Then edit `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-url.com/api
```

### Step 5: Deploy

```bash
npm run deploy
```

Your URL: `https://yourusername.github.io/Cosmic-Timeline/`

### Step 6: Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: Deploy from branch
3. Branch: `gh-pages` / `root`

---

## Deploying Backend to Render

[Render.com](https://render.com) - Free tier includes 750 hours/month

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (recommended for easy deployment)

### Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure as follows:

| Setting | Value |
|---------|-------|
| **Name** | `cosmic-timeline-api` |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

### Step 3: Add Environment Variables

In Render dashboard, go to **Environment** and add:

```
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
NASA_API_KEY=your_nasa_api_key
```

> **Note:** You'll update `FRONTEND_URL` after deploying frontend.

### Step 4: Deploy

Click **"Create Web Service"**

Your API URL will be: `https://your-app-name.onrender.com/api`

**Test deployment:**
```bash
curl https://your-app-name.onrender.com/api/health
```

---

## Railway Deployment

[Railway.app](https://railway.app) - Full-stack deployment with $5/month free credit

### Step 1: Create Railway Account

Sign up at https://railway.app with GitHub

### Step 2: Deploy Backend

1. New Project → Deploy from GitHub Repo
2. Select your repository
3. Set root directory to `backend`
4. Railway auto-detects Node.js
5. Add environment variables:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-frontend.railway.app`
   - `NASA_API_KEY=your_key`

### Step 3: Deploy Frontend

1. In the same project, click **+ New**
2. Add another service from same repo
3. Set root directory to `frontend`
4. Add start command: `npx serve dist -s`
5. Add build command: `npm run build`
6. Add environment variable:
   - `VITE_API_URL=https://your-backend.railway.app/api`

### Step 4: Configure Domains

Railway provides custom domains for each service.

---

## Build Your Own Backend

If you want full control, you can deploy your own backend server.

### Prerequisites

- A free account on [Render](https://render.com) or [Railway](https://railway.app)
- A NASA API key from https://api.nasa.gov

### Quick Setup with Render

1. Fork the repository to your GitHub account
2. Go to Render → New Web Service → Connect your fork
3. Set **Root Directory**: `backend`
4. Add environment variables:

```
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
NASA_API_KEY=your_nasa_api_key
```

5. Deploy and note your backend URL (e.g., `https://your-app.onrender.com`)
6. Use this URL with `/api` suffix in your frontend: `https://your-app.onrender.com/api`

### Backend API Endpoints

Your backend will provide these endpoints:

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/apod` | NASA Astronomy Picture of the Day |
| `GET /api/sky-events` | Celestial events calendar |
| `GET /api/discoveries` | Scientific discoveries |
| `GET /api/history` | Historical space events |
| `GET /api/geocode` | Location geocoding |

### Important Notes

- **Free Tier Limits**: Render's free tier sleeps after 15 minutes of inactivity
- **NASA API Limits**: `DEMO_KEY` allows 30 requests/hour; get your own key for 1000/hour
- **CORS**: Update `FRONTEND_URL` whenever you change your frontend domain

---

## Post-Deployment Checklist

After deployment, verify everything works:

### Backend Checks

- [ ] Health endpoint returns OK:
  ```bash
  curl https://your-backend.onrender.com/api/health
  ```
  Expected: `{"status":"healthy",...}`

- [ ] APOD endpoint works:
  ```bash
  curl https://your-backend.onrender.com/api/apod
  ```

### Frontend Checks

- [ ] Site loads without errors
- [ ] APOD image displays
- [ ] Sky Events section shows events with proper styling
- [ ] Discoveries section loads
- [ ] History section loads ("On This Day" events)
- [ ] No CORS errors in browser console (F12 → Console)
- [ ] Navigation links work
- [ ] Mobile responsive layout

### Update Backend CORS

**Critical:** After deploying frontend, update `FRONTEND_URL` in backend:

```
FRONTEND_URL=https://your-actual-frontend-url.vercel.app
```

---

## Troubleshooting

### CORS Errors

**Symptom:** Console shows `Access-Control-Allow-Origin` errors.

**Fix:**
1. In Render (or your backend host), update `FRONTEND_URL` to match your frontend URL exactly
2. Include the protocol (`https://`)
3. Do NOT include trailing slash

```
✅ FRONTEND_URL=https://cosmic-timeline.vercel.app
❌ FRONTEND_URL=https://cosmic-timeline.vercel.app/
❌ FRONTEND_URL=cosmic-timeline.vercel.app
```

### Rate Limited (429 Error)

**Symptom:** API returns "Too many requests"

**Fix:**
- Wait 15 minutes for rate limit to reset
- Get your own NASA API key at https://api.nasa.gov
- Replace `DEMO_KEY` with your key in backend `.env`

### Backend Sleeps on Render Free Tier

**Symptom:** First request is slow (15-30 seconds)

**Fix:** Use a free uptime monitor:
1. Create account at https://uptimerobot.com
2. Add HTTP monitor for your backend health endpoint
3. Set check interval to 5 minutes

### Build Fails on Deployment

**Common causes:**

1. **Missing package-lock.json**
   ```bash
   npm install
   git add package-lock.json
   git commit -m "Add package-lock.json"
   git push
   ```

2. **Node.js version mismatch**
   - Backend requires Node.js 18+
   - Check your hosting platform's Node.js version settings

3. **Environment variables not set**
   - Verify all required variables are set in hosting dashboard
   - `VITE_` prefix is required for frontend variables

### Frontend Shows "Failed to Load" Errors

**Check:**
1. Backend is running and accessible
2. `VITE_API_URL` is correct in frontend environment
3. No typos in the URL (check for extra `/api/api/`)
4. CORS is properly configured

---

## Quick Reference

| Platform | Type | Free Tier | URL Format |
|----------|------|-----------|------------|
| Cloudflare Pages | Frontend | Unlimited | `xxx.pages.dev` |
| Vercel | Frontend | Unlimited | `xxx.vercel.app` |
| Netlify | Frontend | 100GB/mo | `xxx.netlify.app` |
| GitHub Pages | Frontend | Unlimited | `user.github.io/repo` |
| Render | Backend | 750 hrs/mo | `xxx.onrender.com` |
| Railway | Full Stack | $5 credit | `xxx.up.railway.app` |

---

## Support

If you encounter issues not covered here:

1. Check the browser console (F12) for detailed error messages
2. Verify all environment variables are correctly set
3. Test backend endpoints directly with `curl` or browser
4. Contact the developer: [GitHub - Ashutoshgit47](https://github.com/Ashutoshgit47/Ashutoshgit47)
5. Open an issue on GitHub with:
   - Error message
   - Browser console output
   - Steps to reproduce

---

## Project Structure

```
cosmic-timeline/
├── backend/                 # Node.js/Express API
│   ├── controllers/         # Route handlers
│   │   ├── apodController.js
│   │   ├── geocodeController.js
│   │   ├── onThisDayController.js
│   │   └── skyEventsController.js
│   ├── data/               # Static data (sky events)
│   ├── middleware/         # Rate limiting, error handling
│   ├── routes/             # API route definitions
│   │   ├── apod.js
│   │   ├── discoveries.js
│   │   ├── geocode.js
│   │   ├── history.js
│   │   └── skyEvents.js
│   ├── utils/              # Cache utility
│   ├── server.js           # Main entry point
│   ├── package.json
│   ├── .env.example        # Environment template
│   └── .env                # Your environment variables (DO NOT COMMIT)
│
├── frontend/               # Vite + Vanilla JS + Tailwind v4
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── APOD.js
│   │   │   ├── Discoveries.js
│   │   │   ├── History.js
│   │   │   ├── Navbar.js
│   │   │   └── SkyEvents.js
│   │   ├── utils/          # Helpers
│   │   │   ├── dateFormat.js
│   │   │   ├── location.js
│   │   │   └── timezone.js
│   │   ├── api.js          # API client
│   │   ├── config.js       # Configuration
│   │   ├── main.js         # Entry point
│   │   └── style.css       # Tailwind styles
│   ├── public/             # Static assets
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example            # Development environment template
│   ├── .env.production.example # Production environment template
│   └── .env                    # Your environment variables (DO NOT COMMIT)
│
├── DEPLOYMENT_GUIDE.md     # This file
└── README.md
```

---

## Prerequisites

### Required Software

| Software | Minimum Version | Check Command | Download |
|----------|----------------|---------------|----------|
| Node.js | v18.0.0+ | `node --version` | [nodejs.org](https://nodejs.org) |
| npm | v9.0.0+ | `npm --version` | Included with Node.js |
| Git | Any recent | `git --version` | [git-scm.com](https://git-scm.com) |

### Verify Installation

**Windows (PowerShell):**
```powershell
# Check all prerequisites
node --version; npm --version; git --version
```

**macOS/Linux (Terminal):**
```bash
# Check all prerequisites
node --version && npm --version && git --version
```

### NASA API Key (Optional)

- Get a free API key at: https://api.nasa.gov
- `DEMO_KEY` works for testing (rate-limited to 30 requests/hour)
- Your own key allows up to 1000 requests/hour

---

## Local Development

> 🚨 **CRITICAL SETUP REQUIREMENT**  
> This project uses `.env.example` template files for configuration. You **MUST** copy or rename these files to `.env` (remove the `.example` suffix) in both `backend/` and `frontend/` folders for the project to work.  
> **Files to rename:**
> - `backend/.env.example` → `backend/.env`
> - `frontend/.env.example` → `frontend/.env`

### Step 1: Clone Repository

```bash
git clone https://github.com/Ashutoshgit47/Cosmic-Timeline.git
cd Cosmic-Timeline
```

### Step 2: Setup Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install
```

### Step 3: Create Backend Environment File

> ⚠️ **IMPORTANT**: The project includes `.env.example` template files. You **MUST** rename or copy them to `.env` for the project to work.

**Windows (PowerShell):**
```powershell
# Copy .env.example to .env
Copy-Item .env.example .env
```

**macOS/Linux:**
```bash
# Copy .env.example to .env
cp .env.example .env
```

**Or manually:**
1. Find the file `backend/.env.example`
2. Copy it and rename the copy to `backend/.env`

### Step 4: Configure Backend Environment

Edit `backend/.env` file:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
NASA_API_KEY=DEMO_KEY
```

> **Note:** Replace `DEMO_KEY` with your own NASA API key for better rate limits.

### Step 5: Start Backend Server

```bash
# From the backend folder
npm start

# Or for development with auto-reload (Node.js 18+):
npm run dev
```

✅ Backend runs at: `http://localhost:3000`

**Verify backend is running:**
```bash
# Test health endpoint
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 5,
  "timestamp": "...",
  "version": "1.0.0",
  "cache": {
    "keys": 0,
    "hits": 0,
    "misses": 0,
    "hitRate": "0%"
  }
}
```

### Step 6: Setup Frontend (New Terminal)

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install
```

### Step 7: Create Frontend Environment File

> ⚠️ **IMPORTANT**: You **MUST** rename or copy `.env.example` to `.env` for the frontend to connect to the backend.

**Windows (PowerShell):**
```powershell
# Copy .env.example to .env
Copy-Item .env.example .env
```

**macOS/Linux:**
```bash
# Copy .env.example to .env
cp .env.example .env
```

**Or manually:**
1. Find the file `frontend/.env.example`
2. Copy it and rename the copy to `frontend/.env`

### Step 8: Configure Frontend Environment

Edit `frontend/.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

### Step 9: Start Frontend Development Server

```bash
# From the frontend folder
npm run dev
```

✅ Frontend runs at: `http://localhost:5173`

The browser should automatically open. If not, navigate to `http://localhost:5173`.

---

## Environment Variables

### Backend (backend/.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port (default: 3000) | `3000` |
| `NODE_ENV` | Yes | Environment mode | `development` or `production` |
| `FRONTEND_URL` | Yes | Allowed CORS origin | `https://your-app.vercel.app` |
| `CF_PAGES_URL` | No | Cloudflare Pages URL (auto-allowed) | `https://your-app.pages.dev` |
| `NASA_API_KEY` | No | NASA API key | `your_api_key_here` |
| `RATE_LIMIT_WHITELIST` | No | IPs to skip rate limiting | `127.0.0.1,::1` |
| `NOMINATIM_USER_AGENT` | No | User-Agent for geocoding | `CosmicTimeline/1.0` |

### Frontend (frontend/.env)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend API URL | `https://your-backend.onrender.com/api` |

> **Important:** Never commit `.env` files to version control. Use `.env.example` as templates.

---

## Security Best Practices

### ⚠️ Never Commit Secrets

The following files contain sensitive data and must NEVER be committed to Git:

| File | Contains |
|------|----------|
| `backend/.env` | NASA API key, server config |
| `frontend/.env` | API URL (development) |
| `frontend/.env.production` | API URL (embedded in builds) |

These files are already in `.gitignore`. If you see them in `git status`, something is wrong.

### Verify .gitignore is Working

```bash
# These should NOT appear in git status
git status --porcelain | grep ".env"
# If any .env files show up, add them to .gitignore
```

### API Keys Security

1. **NASA API Key**: While `DEMO_KEY` is fine for testing, get your own key for production
2. **Never expose keys in frontend code**: The backend proxies all API calls
3. **Rotate keys** if you accidentally commit them

### Production URL Warning

The `frontend/.env.production` file is used during `npm run build`. The URL inside gets **embedded into the JavaScript bundle**.

- ✅ Safe to use placeholder in source control
- ⚠️ Update before each production build
- 💡 Better: Use Vercel/Netlify environment variables instead

### Before Going Public

- [ ] Remove any hardcoded localhost URLs
- [ ] Verify `.env` files are in `.gitignore`
- [ ] Get your own NASA API key
- [ ] Update `FRONTEND_URL` in backend for CORS

---

## Deploying Backend to Render

[Render.com](https://render.com) - Free tier includes 750 hours/month

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (recommended for easy deployment)

### Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure as follows:

| Setting | Value |
|---------|-------|
| **Name** | `cosmic-timeline-api` |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | Free |

### Step 3: Add Environment Variables

In Render dashboard, go to **Environment** and add:

```
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
NASA_API_KEY=your_nasa_api_key
```

> **Note:** You'll update `FRONTEND_URL` after deploying frontend.

### Step 4: Deploy

Click **"Create Web Service"**

Your API URL will be: `https://cosmic-timeline-api.onrender.com`

**Test deployment:**
```bash
curl https://cosmic-timeline-api.onrender.com/api/health
```

---

## Deploying Frontend to Vercel

[Vercel.com](https://vercel.com) - Generous free tier with unlimited deployments

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Sign up with GitHub

### Step 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Project Name** | `cosmic-timeline` |
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### Step 3: Add Environment Variable

Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://cosmic-timeline-api.onrender.com/api` |

### Step 4: Deploy

Click **"Deploy"**

Your URL: `https://cosmic-timeline.vercel.app`

### Step 5: Update Backend CORS

Go back to Render and update the `FRONTEND_URL` environment variable:

```
FRONTEND_URL=https://cosmic-timeline.vercel.app
```

Render will automatically redeploy.

---

## Deploying Frontend to Netlify

[Netlify.com](https://netlify.com) - 100GB bandwidth/month free

### Step 1: Create netlify.toml

Create `frontend/netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 2: Deploy

**Option A: Connect GitHub**
1. Go to https://netlify.com
2. New site from Git → Connect repository
3. Set build settings:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

**Option B: Manual Deploy**
```bash
cd frontend
npm run build
# Drag & drop the 'dist' folder to Netlify
```

### Step 3: Add Environment Variable

Site settings → Environment variables:

```
VITE_API_URL=https://cosmic-timeline-api.onrender.com/api
```

Trigger a redeploy after adding the variable.

---

## Deploying Frontend to GitHub Pages

### Step 1: Update vite.config.js

Edit `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Cosmic-Timeline/', // Your repo name
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild'
  },
  server: {
    port: 5173,
    open: true
  },
  preview: {
    port: 4173
  }
})
```

### Step 2: Install gh-pages

```bash
cd frontend
npm install -D gh-pages
```

### Step 3: Add Deploy Script

Update `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

### Step 4: Set Environment Variable

Copy `frontend/.env.production.example` to `frontend/.env.production`:

**Windows (PowerShell):**
```powershell
Copy-Item .env.production.example .env.production
```

**macOS/Linux:**
```bash
cp .env.production.example .env.production
```

Then edit `frontend/.env.production`:

```env
VITE_API_URL=https://cosmic-timeline-api.onrender.com/api
```

### Step 5: Deploy

```bash
npm run deploy
```

Your URL: `https://yourusername.github.io/Cosmic-Timeline/`

### Step 6: Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: Deploy from branch
3. Branch: `gh-pages` / `root`

---

## Railway Deployment

[Railway.app](https://railway.app) - Full-stack deployment with $5/month free credit

### Step 1: Create Railway Account

Sign up at https://railway.app with GitHub

### Step 2: Deploy Backend

1. New Project → Deploy from GitHub Repo
2. Select your repository
3. Set root directory to `backend`
4. Railway auto-detects Node.js
5. Add environment variables:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-frontend.railway.app`
   - `NASA_API_KEY=your_key`

### Step 3: Deploy Frontend

1. In the same project, click **+ New**
2. Add another service from same repo
3. Set root directory to `frontend`
4. Add start command: `npx serve dist -s`
5. Add build command: `npm run build`
6. Add environment variable:
   - `VITE_API_URL=https://your-backend.railway.app/api`

### Step 4: Configure Domains

Railway provides custom domains for each service.

---

## Post-Deployment Checklist

After deployment, verify everything works:

### Backend Checks

- [ ] Health endpoint returns OK:
  ```bash
  curl https://your-backend.onrender.com/api/health
  ```
  Expected: `{"status":"healthy",...}`

- [ ] APOD endpoint works:
  ```bash
  curl https://your-backend.onrender.com/api/apod
  ```

- [ ] Sky events endpoint works:
  ```bash
  curl https://your-backend.onrender.com/api/sky-events
  ```

- [ ] Discoveries endpoint works:
  ```bash
  curl https://your-backend.onrender.com/api/discoveries
  ```

- [ ] History endpoint works:
  ```bash
  curl https://your-backend.onrender.com/api/history
  ```

- [ ] Geocode endpoint works:
  ```bash
  curl https://your-backend.onrender.com/api/geocode?q=London
  ```

### Frontend Checks

- [ ] Site loads without errors
- [ ] APOD image displays
- [ ] Sky Events section shows events with proper styling
- [ ] Discoveries section loads
- [ ] History section loads ("On This Day" events)
- [ ] Location-based features work (geocoding)
- [ ] No CORS errors in browser console (F12 → Console)
- [ ] Navigation links work
- [ ] Mobile responsive layout

### Update Backend CORS

**Critical:** After deploying frontend, update `FRONTEND_URL` in backend:

```
FRONTEND_URL=https://your-actual-frontend-url.vercel.app
```

---

## Troubleshooting

### CORS Errors

**Symptom:** Console shows `Access-Control-Allow-Origin` errors.

**Fix:**
1. In Render (or your backend host), update `FRONTEND_URL` to match your frontend URL exactly
2. Include the protocol (`https://`)
3. Do NOT include trailing slash

```
✅ FRONTEND_URL=https://cosmic-timeline.vercel.app
❌ FRONTEND_URL=https://cosmic-timeline.vercel.app/
❌ FRONTEND_URL=cosmic-timeline.vercel.app
```

### Rate Limited (429 Error)

**Symptom:** API returns "Too many requests"

**Fix:**
- Wait 15 minutes for rate limit to reset
- Get your own NASA API key at https://api.nasa.gov
- Replace `DEMO_KEY` with your key in backend `.env`

### Backend Sleeps on Render Free Tier

**Symptom:** First request is slow (15-30 seconds)

**Fix:** Use a free uptime monitor:
1. Create account at https://uptimerobot.com
2. Add HTTP monitor for `https://your-backend.onrender.com/api/health`
3. Set check interval to 5 minutes

### Build Fails on Deployment

**Common causes:**

1. **Missing package-lock.json**
   ```bash
   npm install
   git add package-lock.json
   git commit -m "Add package-lock.json"
   git push
   ```

2. **Node.js version mismatch**
   - Backend requires Node.js 18+
   - Check your hosting platform's Node.js version settings

3. **Environment variables not set**
   - Verify all required variables are set in hosting dashboard
   - `VITE_` prefix is required for frontend variables

### Frontend Shows "Failed to Load" Errors

**Check:**
1. Backend is running and accessible
2. `VITE_API_URL` is correct in frontend `.env`
3. No typos in the URL (check for extra `/api/api/`)
4. CORS is properly configured

### Sky Events Not Showing Colors

**This was fixed.** If you pulled old code:
1. Update `frontend/src/components/SkyEvents.js`
2. Rebuild: `npm run build`
3. Redeploy

---

## Quick Reference

| Platform | Type | Free Tier | URL Format |
|----------|------|-----------|------------|
| Render | Backend | 750 hrs/mo | `xxx.onrender.com` |
| Vercel | Frontend | Unlimited | `xxx.vercel.app` |
| Netlify | Frontend | 100GB/mo | `xxx.netlify.app` |
| GitHub Pages | Frontend | Unlimited | `user.github.io/repo` |
| Railway | Full Stack | $5 credit | `xxx.up.railway.app` |

---

## Support

If you encounter issues not covered here:

1. Check the browser console (F12) for detailed error messages
2. Verify all environment variables are correctly set
3. Test backend endpoints directly with `curl` or browser
4. Open an issue on GitHub with:
   - Error message
   - Browser console output
   - Steps to reproduce
