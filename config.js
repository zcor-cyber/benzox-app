// Configuration for different environments
const config = {
  development: {
    API_BASE: 'http://localhost:3002/api'
  },
  production: {
    API_BASE: 'https://benzox-backend.onrender.com/api'
  }
};

// Auto-detect environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const currentConfig = config[isProduction ? 'production' : 'development'];

// Export the current configuration
window.APP_CONFIG = currentConfig;
