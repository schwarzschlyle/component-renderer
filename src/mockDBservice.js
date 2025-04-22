/**
 * MockDBService.js
 * A service that provides database-like operations on localStorage
 */

class MockDBService {
    constructor() {
      this.initializeMockData();
    }
  
    /**
     * Initialize mock data if not already present in localStorage
     */
    initializeMockData() {
      const dataSources = [
        { id: 'users', name: 'Users', description: 'User profiles and settings', icon: 'Person', count: 2453 },
        { id: 'products', name: 'Products', description: 'Product catalog data', icon: 'Inventory', count: 842 },
        { id: 'orders', name: 'Orders', description: 'Customer order history', icon: 'ShoppingCart', count: 1253 },
        { id: 'analytics', name: 'Analytics', description: 'Site usage statistics', icon: 'BarChart', count: 15289 },
        { id: 'settings', name: 'Settings', description: 'Application configuration', icon: 'Settings', count: 37 }
      ];
  
      dataSources.forEach(source => {
        const storageKey = `mock_data_${source.id}`;
        if (!localStorage.getItem(storageKey)) {
          let mockData;
          
          switch (source.id) {
            case 'users':
              mockData = Array.from({ length: 50 }, (_, i) => ({
                id: i + 1,
                name: `User ${i + 1}`,
                email: `user${i + 1}@example.com`,
                role: i % 5 === 0 ? 'admin' : 'user',
                lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
              }));
              break;
            case 'products':
              mockData = Array.from({ length: 30 }, (_, i) => ({
                id: i + 1,
                name: `Product ${i + 1}`,
                price: Math.floor(Math.random() * 10000) / 100,
                category: ['Electronics', 'Clothing', 'Food', 'Books'][Math.floor(Math.random() * 4)],
                inStock: Math.random() > 0.3
              }));
              break;
            case 'orders':
              mockData = Array.from({ length: 40 }, (_, i) => ({
                id: i + 1,
                userId: Math.floor(Math.random() * 50) + 1,
                total: Math.floor(Math.random() * 50000) / 100,
                items: Math.floor(Math.random() * 5) + 1,
                date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
                status: ['Pending', 'Shipped', 'Delivered', 'Cancelled'][Math.floor(Math.random() * 4)]
              }));
              break;
            case 'analytics':
              mockData = Array.from({ length: 30 }, (_, i) => ({
                date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                pageViews: Math.floor(Math.random() * 10000),
                uniqueVisitors: Math.floor(Math.random() * 5000),
                bounceRate: Math.floor(Math.random() * 100),
                avgSessionTime: Math.floor(Math.random() * 300)
              }));
              break;
            case 'settings':
              mockData = {
                theme: 'dark',
                notifications: true,
                emailFrequency: 'daily',
                language: 'en',
                timezone: 'UTC',
                security: {
                  twoFactorEnabled: true,
                  passwordResetInterval: 90,
                  sessionTimeout: 30
                }
              };
              break;
            default:
              mockData = [];
          }
          
          localStorage.setItem(storageKey, JSON.stringify(mockData));
        }
      });
    }
  
    /**
     * Get all available data sources
     * @returns {Array} Array of data source metadata
     */
    getDataSources() {
      return [
        { id: 'users', name: 'Users', description: 'User profiles and settings', icon: 'Person', count: this.count('users') },
        { id: 'products', name: 'Products', description: 'Product catalog data', icon: 'Inventory', count: this.count('products') },
        { id: 'orders', name: 'Orders', description: 'Customer order history', icon: 'ShoppingCart', count: this.count('orders') },
        { id: 'analytics', name: 'Analytics', description: 'Site usage statistics', icon: 'BarChart', count: this.count('analytics') },
        { id: 'settings', name: 'Settings', description: 'Application configuration', icon: 'Settings', count: 1 }
      ];
    }
  
    /**
     * Get the storage key for a collection
     * @param {string} collection - Name of the collection
     * @returns {string} Storage key
     */
    getStorageKey(collection) {
      return `mock_data_${collection}`;
    }
  
    /**
     * Get all items from a collection
     * @param {string} collection - Name of the collection
     * @returns {Array|Object} The data from the collection
     */
    getAll(collection) {
      try {
        const data = localStorage.getItem(this.getStorageKey(collection));
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error(`Error retrieving ${collection}:`, error);
        return null;
      }
    }
  
    /**
     * Count items in a collection
     * @param {string} collection - Name of the collection
     * @returns {number} Number of items
     */
    count(collection) {
      const data = this.getAll(collection);
      if (Array.isArray(data)) {
        return data.length;
      } else if (data && typeof data === 'object') {
        return 1; // For object-based collections like settings
      }
      return 0;
    }
  
    /**
     * Get a single item by ID
     * @param {string} collection - Name of the collection
     * @param {number|string} id - ID of the item
     * @returns {Object|null} The item or null if not found
     */
    getById(collection, id) {
      const data = this.getAll(collection);
      if (Array.isArray(data)) {
        return data.find(item => item.id == id) || null;
      }
      return null;
    }
  
    /**
     * Query items with filters
     * @param {string} collection - Name of the collection
     * @param {Object} filters - Object with key/value pairs to filter by
     * @param {Object} options - Query options (sort, limit, skip)
     * @returns {Array} Filtered items
     */
    query(collection, filters = {}, options = {}) {
      const data = this.getAll(collection);
      if (!Array.isArray(data)) {
        return [];
      }
  
      // Apply filters
      let result = data.filter(item => {
        return Object.entries(filters).every(([key, value]) => {
          // Support for partial string matches with regex
          if (typeof value === 'string' && typeof item[key] === 'string') {
            return item[key].toLowerCase().includes(value.toLowerCase());
          }
          return item[key] === value;
        });
      });
  
      // Apply sorting
      if (options.sort) {
        const [field, order] = options.sort.split(':');
        result.sort((a, b) => {
          if (a[field] < b[field]) return order === 'desc' ? 1 : -1;
          if (a[field] > b[field]) return order === 'desc' ? -1 : 1;
          return 0;
        });
      }
  
      // Apply pagination
      if (options.skip) {
        result = result.slice(options.skip);
      }
      if (options.limit) {
        result = result.slice(0, options.limit);
      }
  
      return result;
    }
  
    /**
     * Create a new item
     * @param {string} collection - Name of the collection
     * @param {Object} item - The item to create
     * @returns {Object} The created item
     */
    create(collection, item) {
      const data = this.getAll(collection);
      if (!Array.isArray(data)) {
        throw new Error(`Collection ${collection} is not an array`);
      }
  
      // Generate new ID if not provided
      const newItem = { 
        ...item,
        id: item.id || Math.max(0, ...data.map(i => i.id)) + 1,
        createdAt: new Date().toISOString()
      };
  
      // Add to collection
      const updatedData = [...data, newItem];
      localStorage.setItem(this.getStorageKey(collection), JSON.stringify(updatedData));
      
      return newItem;
    }
  
    /**
     * Update an existing item
     * @param {string} collection - Name of the collection
     * @param {number|string} id - ID of the item to update
     * @param {Object} updates - The fields to update
     * @returns {Object|null} The updated item or null if not found
     */
    update(collection, id, updates) {
      const data = this.getAll(collection);
      if (!Array.isArray(data)) {
        throw new Error(`Collection ${collection} is not an array`);
      }
  
      const index = data.findIndex(item => item.id == id);
      if (index === -1) {
        return null;
      }
  
      // Update the item
      const updatedItem = { 
        ...data[index], 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const updatedData = [...data];
      updatedData[index] = updatedItem;
      
      localStorage.setItem(this.getStorageKey(collection), JSON.stringify(updatedData));
      
      return updatedItem;
    }
  
    /**
     * Delete an item
     * @param {string} collection - Name of the collection
     * @param {number|string} id - ID of the item to delete
     * @returns {boolean} True if deleted, false if not found
     */
    delete(collection, id) {
      const data = this.getAll(collection);
      if (!Array.isArray(data)) {
        throw new Error(`Collection ${collection} is not an array`);
      }
  
      const initialLength = data.length;
      const updatedData = data.filter(item => item.id != id);
      
      if (initialLength === updatedData.length) {
        return false;
      }
      
      localStorage.setItem(this.getStorageKey(collection), JSON.stringify(updatedData));
      return true;
    }
  
    /**
     * Update settings object
     * @param {Object} updates - The settings to update
     * @returns {Object} The updated settings
     */
    updateSettings(updates) {
      const settings = this.getAll('settings') || {};
      const updatedSettings = { ...settings, ...updates };
      localStorage.setItem(this.getStorageKey('settings'), JSON.stringify(updatedSettings));
      return updatedSettings;
    }
  
    /**
     * Clear all data for a collection
     * @param {string} collection - Name of the collection
     */
    clear(collection) {
      localStorage.removeItem(this.getStorageKey(collection));
    }
  
    /**
     * Clear all mock data
     */
    clearAll() {
      ['users', 'products', 'orders', 'analytics', 'settings'].forEach(collection => {
        this.clear(collection);
      });
    }
  
    /**
     * Reset a collection to initial state
     * @param {string} collection - Name of the collection
     */
    reset(collection) {
      this.clear(collection);
      this.initializeMockData();
    }
  }
  
  // Export a singleton instance
  const mockDB = new MockDBService();
  export default mockDB;