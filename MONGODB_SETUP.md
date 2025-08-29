# MongoDB Atlas Setup Guide

## Why MongoDB Atlas?

The previous solution used local JSON files which get wiped out every time Render redeploys or restarts. MongoDB Atlas provides:

✅ **True persistence** - Data survives server restarts  
✅ **Cross-device sync** - Data stored in the cloud  
✅ **Free tier** - 512MB storage, perfect for testing  
✅ **Automatic backups** - Data is never lost  

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose "Free" tier (M0)
4. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
5. Choose a region close to you

## Step 2: Create Database Cluster

1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider and region
4. Click "Create"

## Step 3: Set Up Database Access

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

## Step 4: Set Up Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

## Step 5: Get Connection String

1. In the left sidebar, click "Database"
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string

## Step 6: Update Environment Variables

1. In Render.com, go to your service
2. Click "Environment" tab
3. Add this environment variable:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/benzox_app?retryWrites=true&w=majority
```

**Replace:**
- `username` with your database username
- `password` with your database password
- `cluster.mongodb.net` with your actual cluster URL

## Step 7: Deploy

1. Push your code to GitHub
2. Render will automatically redeploy
3. Check the logs to ensure MongoDB connects successfully

## Testing

After deployment:

1. **Login to your app** on one device
2. **Create some data** using the test page
3. **Login on another device** with the same account
4. **Verify data appears** automatically

## Troubleshooting

### Connection Failed
- Check your `MONGODB_URI` environment variable
- Ensure network access allows connections from anywhere
- Verify username/password are correct

### Data Not Syncing
- Check server logs for MongoDB connection status
- Use the `/api/health` endpoint to verify database connection
- Ensure all routes are using `await` properly

## Benefits

With MongoDB Atlas:
- ✅ **Data persists** between server restarts
- ✅ **Cross-device synchronization** works reliably
- ✅ **No data loss** during deployments
- ✅ **Scalable** for future growth
- ✅ **Professional** database solution

## Next Steps

Once MongoDB is working:
1. Test cross-device data sync
2. Create real user data
3. Monitor database usage in Atlas dashboard
4. Consider upgrading to paid tier if needed

---

**Need help?** Check the server logs in Render for detailed error messages.
