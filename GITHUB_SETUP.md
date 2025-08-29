# 🚀 GitHub Setup for Render Deployment

## Step 1: Create GitHub Repository

1. **Go to GitHub.com** and sign in
2. **Click the "+" icon** in the top right corner
3. **Select "New repository"**
4. **Fill in the details:**
   - **Repository name**: `benzox-app`
   - **Description**: `Benzox authentication app with Node.js backend`
   - **Make it Public** (Render needs access)
   - **Don't initialize** with README (we already have one)
5. **Click "Create repository"**

## Step 2: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/benzox-app.git

# Push the code to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Render

1. **Go to [render.com](https://render.com)**
2. **Sign in with GitHub**
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub account** (if not already connected)
5. **Select the `benzox-app` repository**
6. **Configure:**
   - **Name**: `benzox-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
7. **Add Environment Variables:**
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (leave empty, Render will auto-generate)
8. **Click "Create Web Service"**

## Step 4: Update Frontend Config

Once deployed, copy your Render URL and update `config.js`:

```javascript
production: {
  API_BASE: 'https://YOUR-RENDER-URL.onrender.com/api'
}
```

## Step 5: Redeploy Frontend

```bash
netlify deploy --prod --dir=.
```

## ✅ What This Achieves:
- **GitHub repository** for version control
- **Render backend** accessible from anywhere
- **No more "Network error"** on any browser
- **Full cloud deployment** working everywhere
