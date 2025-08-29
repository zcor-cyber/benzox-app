# 🚀 Deploy Backend to Render

## Quick Steps:

### 1. Go to Render.com
- Visit [render.com](https://render.com)
- Sign up/Login with GitHub

### 2. Create New Web Service
- Click "New +" button
- Select "Web Service"
- Connect your GitHub account
- Select this repository: `benzox-app`

### 3. Configure Service
- **Name**: `benzox-backend`
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Plan**: `Free`

### 4. Environment Variables
- `NODE_ENV`: `production`
- `JWT_SECRET`: (leave empty, Render will auto-generate)

### 5. Deploy!
- Click "Create Web Service"
- Wait for build to complete
- Copy the URL (e.g., `https://benzox-backend.onrender.com`)

### 6. Update Frontend Config
Once deployed, update `config.js` with your Render URL:
```javascript
production: {
  API_BASE: 'https://YOUR-RENDER-URL.onrender.com/api'
}
```

### 7. Redeploy Frontend
```bash
netlify deploy --prod --dir=.
```

## ✅ What This Fixes:
- **No more "Network error"** on different browsers
- **Works everywhere** (Chrome, Brave, Safari, mobile)
- **Real database** with user accounts
- **Secure authentication** system

## 🔧 Current Status:
- ✅ **Frontend**: Deployed to Netlify
- ✅ **Backend**: Ready to deploy to Render
- ✅ **Database**: SQLite with user tables
- ✅ **Auth**: Username + Password only
