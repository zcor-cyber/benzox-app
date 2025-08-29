# Benzox App

A secure user authentication and data management application.

## Features

- User registration and login (username + password only)
- JWT token authentication
- SQLite database storage
- Secure password hashing
- User data management

## Deployment

### Frontend (Netlify)
The frontend is automatically deployed to Netlify from this repository.

### Backend (Render)
To deploy the backend to Render:

1. Go to [render.com](https://render.com)
2. Create a new account or sign in
3. Click "New +" and select "Web Service"
4. Connect your GitHub repository
5. Configure the service:
   - **Name**: benzox-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

6. Add environment variables:
   - `NODE_ENV`: production
   - `JWT_SECRET`: (auto-generated)

7. Deploy!

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the backend server:
   ```bash
   node server.js
   ```

3. Open http://localhost:3001 in your browser

## API Endpoints

- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile
- `POST /api/data` - Save user data
- `GET /api/data/:type` - Get user data

## Environment Variables

- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
