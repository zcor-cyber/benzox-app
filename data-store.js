const fs = require('fs');
const path = require('path');

class DataStore {
  constructor() {
    // Use a consistent path for production to ensure data persistence
    this.dataPath = process.env.NODE_ENV === 'production' ? '/tmp/benzox-data.json' : './benzox-data.json';
    this.data = this.loadData();
    console.log(`Data store initialized at: ${this.dataPath}`);
    console.log(`Current data: ${this.data.users.length} users, ${this.data.userData.length} data entries`);
    
    // Auto-save every 30 seconds to prevent data loss
    setInterval(() => {
      this.saveData();
    }, 30000);
  }

  loadData() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const fileContent = fs.readFileSync(this.dataPath, 'utf8');
        const parsed = JSON.parse(fileContent);
        console.log(`Loaded existing data: ${parsed.users.length} users, ${parsed.userData.length} data entries`);
        return parsed;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    
    const defaultData = {
      users: [],
      userData: []
    };
    
    console.log('Created new data store with default structure');
    return defaultData;
  }

  saveData() {
    try {
      const dataToSave = {
        users: this.data.users,
        userData: this.data.userData,
        lastSaved: new Date().toISOString(),
        version: '1.0'
      };
      
      fs.writeFileSync(this.dataPath, JSON.stringify(dataToSave, null, 2));
      console.log(`Data saved successfully to ${this.dataPath}`);
      console.log(`Current stats: ${this.data.users.length} users, ${this.data.userData.length} data entries`);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // User methods
  createUser(username, password) {
    console.log(`Creating user: ${username}`);
    
    const existingUser = this.data.users.find(u => u.username === username);
    if (existingUser) {
      console.log(`User ${username} already exists`);
      throw new Error('Username already exists');
    }

    const user = {
      id: Date.now() + Math.random(),
      username,
      password,
      created_at: new Date().toISOString()
    };

    this.data.users.push(user);
    console.log(`User ${username} created with ID: ${user.id}`);
    
    this.saveData();
    return user;
  }

  findUser(username) {
    const user = this.data.users.find(u => u.username === username);
    console.log(`Looking for user: ${username}, found: ${user ? 'yes' : 'no'}`);
    return user;
  }

  findUserById(id) {
    const user = this.data.users.find(u => u.id === id);
    console.log(`Looking for user by ID: ${id}, found: ${user ? 'yes' : 'no'}`);
    return user;
  }

  // User data methods
  saveUserData(userId, dataType, dataContent) {
    console.log(`Saving data for user ${userId}, type: ${dataType}`);
    
    const dataEntry = {
      id: Date.now() + Math.random(),
      user_id: userId,
      data_type: dataType,
      data_content: dataContent,
      created_at: new Date().toISOString()
    };

    this.data.userData.push(dataEntry);
    console.log(`Data saved with ID: ${dataEntry.id}`);
    
    this.saveData();
    return dataEntry;
  }

  getUserData(userId, dataType) {
    const data = this.data.userData
      .filter(d => d.user_id === userId && d.data_type === dataType)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    console.log(`Getting data for user ${userId}, type ${dataType}: ${data.length} entries found`);
    return data;
  }

  // Get all data for a user
  getAllUserData(userId) {
    const data = this.data.userData
      .filter(d => d.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    console.log(`Getting all data for user ${userId}: ${data.length} total entries found`);
    return data;
  }

  // Get user summary with data count
  getUserSummary(userId) {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) {
      console.log(`User ${userId} not found for summary`);
      return null;
    }
    
    const userData = this.getAllUserData(userId);
    const dataByType = {};
    
    userData.forEach(item => {
      if (!dataByType[item.data_type]) {
        dataByType[item.data_type] = [];
      }
      dataByType[item.data_type].push(item);
    });
    
    const summary = {
      user: {
        id: user.id,
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
  }

  // Health check
  getStats() {
    const stats = {
      userCount: this.data.users.length,
      dataCount: this.data.userData.length,
      lastSave: new Date().toISOString(),
      dataPath: this.dataPath,
      environment: process.env.NODE_ENV || 'development'
    };
    
    console.log(`Stats requested: ${stats.userCount} users, ${stats.dataCount} data entries`);
    return stats;
  }

  // Debug method to show all data
  debugData() {
    console.log('=== DATA STORE DEBUG ===');
    console.log(`Path: ${this.dataPath}`);
    console.log(`Users:`, this.data.users.map(u => ({ id: u.id, username: u.username })));
    console.log(`User Data:`, this.data.userData.map(d => ({ 
      id: d.id, 
      user_id: d.user_id, 
      type: d.data_type, 
      content: d.data_content 
    })));
    console.log('=== END DEBUG ===');
  }
}

module.exports = DataStore;
