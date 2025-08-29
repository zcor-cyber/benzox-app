const { MongoClient, ObjectId } = require('mongodb');

class MongoDBStore {
  constructor() {
    // MongoDB connection string - will be set via environment variable
    this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    this.dbName = 'benzox_app';
    this.client = null;
    this.db = null;
    this.usersCollection = null;
    this.userDataCollection = null;
    
    console.log('MongoDB store initialized');
    console.log('Environment:', process.env.NODE_ENV || 'development');
  }

  async connect() {
    try {
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      
      this.db = this.client.db(this.dbName);
      this.usersCollection = this.db.collection('users');
      this.userDataCollection = this.db.collection('user_data');
      
      // Create indexes for better performance
      await this.usersCollection.createIndex({ username: 1 }, { unique: true });
      await this.userDataCollection.createIndex({ user_id: 1, data_type: 1 });
      await this.userDataCollection.createIndex({ user_id: 1, created_at: -1 });
      
      console.log('Connected to MongoDB successfully');
      console.log(`Database: ${this.dbName}`);
      
      // Log current stats
      const userCount = await this.usersCollection.countDocuments();
      const dataCount = await this.userDataCollection.countDocuments();
      console.log(`Current stats: ${userCount} users, ${dataCount} data entries`);
      
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('MongoDB connection closed');
    }
  }

  // User methods
  async createUser(username, password) {
    console.log(`Creating user: ${username}`);
    
    try {
      const existingUser = await this.usersCollection.findOne({ username });
      if (existingUser) {
        console.log(`User ${username} already exists`);
        throw new Error('Username already exists');
      }

      const user = {
        username,
        password,
        created_at: new Date()
      };

      const result = await this.usersCollection.insertOne(user);
      user._id = result.insertedId;
      
      console.log(`User ${username} created with ID: ${user._id}`);
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async findUser(username) {
    try {
      const user = await this.usersCollection.findOne({ username });
      console.log(`Looking for user: ${username}, found: ${user ? 'yes' : 'no'}`);
      return user;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  async findUserById(id) {
    try {
      const user = await this.usersCollection.findOne({ _id: new ObjectId(id) });
      console.log(`Looking for user by ID: ${id}, found: ${user ? 'yes' : 'no'}`);
      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  // User data methods
  async saveUserData(userId, dataType, dataContent) {
    console.log(`Saving data for user ${userId}, type: ${dataType}`);
    
    try {
      const dataEntry = {
        user_id: userId,
        data_type: dataType,
        data_content: dataContent,
        created_at: new Date()
      };

      const result = await this.userDataCollection.insertOne(dataEntry);
      dataEntry._id = result.insertedId;
      
      console.log(`Data saved with ID: ${dataEntry._id}`);
      return dataEntry;
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  async getUserData(userId, dataType) {
    try {
      const data = await this.userDataCollection
        .find({ user_id: userId, data_type: dataType })
        .sort({ created_at: -1 })
        .toArray();
      
      console.log(`Getting data for user ${userId}, type ${dataType}: ${data.length} entries found`);
      return data;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }

  // Get all data for a user
  async getAllUserData(userId) {
    try {
      const data = await this.userDataCollection
        .find({ user_id: userId })
        .sort({ created_at: -1 })
        .toArray();
      
      console.log(`Getting all data for user ${userId}: ${data.length} total entries found`);
      return data;
    } catch (error) {
      console.error('Error getting all user data:', error);
      throw error;
    }
  }

  // Get user summary with data count
  async getUserSummary(userId) {
    try {
      const user = await this.findUserById(userId);
      if (!user) {
        console.log(`User ${userId} not found for summary`);
        return null;
      }
      
      const userData = await this.getAllUserData(userId);
      const dataByType = {};
      
      userData.forEach(item => {
        if (!dataByType[item.data_type]) {
          dataByType[item.data_type] = [];
        }
        dataByType[item.data_type].push(item);
      });
      
      const summary = {
        user: {
          id: user._id,
          username: user.username,
          created_at: user.created_at
        },
        dataSummary: Object.keys(dataByType).map(type => ({
          type,
          count: dataByType[type].length,
          latest: dataByType[type][0]
        }))
      };
      
      console.log(`Generated summary for user ${userId}: ${summary.dataSummary.length} data types`);
      return summary;
    } catch (error) {
      console.error('Error getting user summary:', error);
      throw error;
    }
  }

  // Health check
  async getStats() {
    try {
      const userCount = await this.usersCollection.countDocuments();
      const dataCount = await this.userDataCollection.countDocuments();
      
      const stats = {
        userCount,
        dataCount,
        lastCheck: new Date().toISOString(),
        database: this.dbName,
        environment: process.env.NODE_ENV || 'development',
        connected: this.client && this.client.topology && this.client.topology.isConnected()
      };
      
      console.log(`Stats requested: ${stats.userCount} users, ${stats.dataCount} data entries`);
      return stats;
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  // Debug method to show all data
  async debugData() {
    try {
      console.log('=== MONGODB STORE DEBUG ===');
      console.log(`Database: ${this.dbName}`);
      console.log(`Connected: ${this.client && this.client.topology && this.client.topology.isConnected()}`);
      
      const users = await this.usersCollection.find({}).toArray();
      const userData = await this.userDataCollection.find({}).toArray();
      
      console.log(`Users:`, users.map(u => ({ id: u._id, username: u.username })));
      console.log(`User Data:`, userData.map(d => ({ 
        id: d._id, 
        user_id: d.user_id, 
        type: d.data_type, 
        content: d.data_content 
      })));
      console.log('=== END DEBUG ===');
    } catch (error) {
      console.error('Error in debug data:', error);
      throw error;
    }
  }

  // Test connection
  async testConnection() {
    try {
      await this.db.admin().ping();
      console.log('MongoDB connection test successful');
      return true;
    } catch (error) {
      console.error('MongoDB connection test failed:', error);
      return false;
    }
  }
}

module.exports = MongoDBStore;
