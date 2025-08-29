const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const path = require('path');
const MongoDBStore = require('./mongodb-store');

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Initialize MongoDB store
const dataStore = new MongoDBStore();
console.log('MongoDB store initialized');
console.log('Environment:', process.env.NODE_ENV || 'development');

// Connect to MongoDB
dataStore.connect().then(() => {
  console.log('MongoDB connection established');
}).catch(error => {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
});

// Validation middleware
const validateRegistration = [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateLogin = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// User registration
app.post('/api/register', validateRegistration, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

         // Create user
     const user = await dataStore.createUser(username, hashedPassword);
     
     // Generate JWT token
     const token = jwt.sign({ id: user._id.toString(), username }, JWT_SECRET, { expiresIn: '24h' });
     
     res.status(201).json({
       message: 'User created successfully',
       token,
       user: { id: user._id.toString(), username }
     });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message === 'Username already exists') {
      res.status(400).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// User login
app.post('/api/login', validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const user = dataStore.findUser(username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

         // Generate JWT token
     const token = jwt.sign({ id: user._id.toString(), username: user.username }, JWT_SECRET, { expiresIn: '24h' });
     
     res.json({
       message: 'Login successful',
       token,
       user: { id: user._id.toString(), username: user.username }
     });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await dataStore.findUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
         res.json({ 
       user: {
         id: user._id.toString(),
         username: user.username,
         created_at: user.created_at
       }
     });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Save user data
app.post('/api/data', authenticateToken, async (req, res) => {
  const { dataType, dataContent } = req.body;
  
  if (!dataType || !dataContent) {
    return res.status(400).json({ error: 'Data type and content are required' });
  }

  try {
    const result = await dataStore.saveUserData(req.user.id, dataType, dataContent);
    
    res.json({ message: 'Data saved successfully', id: result._id });
  } catch (error) {
    console.error('Save data error:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Get user data
app.get('/api/data/:dataType', authenticateToken, async (req, res) => {
  const { dataType } = req.params;
  
  try {
    const data = await dataStore.getUserData(req.user.id, dataType);
    
    res.json({ data });
  } catch (error) {
    console.error('Get data error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all user data and summary
app.get('/api/user/summary', authenticateToken, async (req, res) => {
  try {
    const summary = await dataStore.getUserSummary(req.user.id);
    
    if (!summary) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(summary);
  } catch (error) {
    console.error('Get user summary error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all user data
app.get('/api/user/all-data', authenticateToken, async (req, res) => {
  try {
    const allData = await dataStore.getAllUserData(req.user.id);
    
    res.json({ data: allData });
  } catch (error) {
  console.error('Get all user data error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Serve the main app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`App available at: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB database: ${dataStore.dbName}`);
});

// Add a simple health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const stats = await dataStore.getStats();
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      stats
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed' });
  }
});

// Debug endpoint to see all data
app.get('/api/debug', async (req, res) => {
  try {
    await dataStore.debugData();
    const stats = await dataStore.getStats();
    res.json({ 
      message: 'Debug data logged to console',
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Debug failed' });
  }
});

// Test endpoint to create sample data
app.post('/api/test/create-sample-data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Create sample data entries
    const sampleData = [
      { type: 'notes', content: 'Sample note 1' },
      { type: 'notes', content: 'Sample note 2' },
      { type: 'tasks', content: 'Sample task 1' },
      { type: 'tasks', content: 'Sample task 2' }
    ];
    
    const createdData = [];
    for (const item of sampleData) {
      const result = await dataStore.saveUserData(userId, item.type, item.content);
      createdData.push(result);
    }
    
    res.json({ 
      message: 'Sample data created successfully',
      created: createdData.length,
      data: createdData
    });
  } catch (error) {
    console.error('Create sample data error:', error);
    res.status(500).json({ error: 'Failed to create sample data' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing MongoDB connection...');
  await dataStore.disconnect();
  process.exit(0);
});
