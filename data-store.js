const fs = require('fs');
const path = require('path');

class DataStore {
  constructor() {
    this.dataPath = process.env.NODE_ENV === 'production' ? '/tmp/data.json' : './data.json';
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const fileContent = fs.readFileSync(this.dataPath, 'utf8');
        return JSON.parse(fileContent);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    return {
      users: [],
      userData: []
    };
  }

  saveData() {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // User methods
  createUser(username, password) {
    const existingUser = this.data.users.find(u => u.username === username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    const user = {
      id: Date.now() + Math.random(),
      username,
      password,
      created_at: new Date().toISOString()
    };

    this.data.users.push(user);
    this.saveData();
    return user;
  }

  findUser(username) {
    return this.data.users.find(u => u.username === username);
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  // User data methods
  saveUserData(userId, dataType, dataContent) {
    const dataEntry = {
      id: Date.now() + Math.random(),
      user_id: userId,
      data_type: dataType,
      data_content: dataContent,
      created_at: new Date().toISOString()
    };

    this.data.userData.push(dataEntry);
    this.saveData();
    return dataEntry;
  }

  getUserData(userId, dataType) {
    return this.data.userData
      .filter(d => d.user_id === userId && d.data_type === dataType)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // Health check
  getStats() {
    return {
      userCount: this.data.users.length,
      dataCount: this.data.userData.length,
      lastSave: new Date().toISOString()
    };
  }
}

module.exports = DataStore;
