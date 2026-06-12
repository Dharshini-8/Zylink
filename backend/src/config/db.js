const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '../../db.json');

const db = {
  users: [],
  urls: [],
  analytics: []
};

// Helper to save db to file
const saveDB = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save mock database to file:', err.message);
  }
};

// Helper to load db from file
const loadDB = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      db.users = parsed.users || [];
      db.urls = parsed.urls || [];
      db.analytics = parsed.analytics || [];
      console.log(`Loaded mock database from ${DB_FILE} (${db.users.length} users, ${db.urls.length} urls, ${db.analytics.length} analytics)`);
    } else {
      saveDB();
    }
  } catch (err) {
    console.error('Failed to load mock database from file:', err.message);
  }
};

const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zylink';
  try {
    const conn = await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Standard MongoDB Connection Failed: ${error.message}`);
    console.log('Falling back to robust file-based database mock...');
    
    // Stub mongoose connection
    mongoose.connect = async () => {
      return { connection: { host: 'localhost-mock' } };
    };
    
    setupMock();
  }
};

function setupMock() {
  // Load existing data if any
  loadDB();

  // Pre-load mongoose models so they are registered in Mongoose
  const User = require('../models/User');
  const Url = require('../models/Url');
  const Analytics = require('../models/Analytics');

  // Helper to hydrate User objects with required prototype/methods
  function hydrateUser(user) {
    if (!user) return null;
    user.comparePassword = async function(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };
    user.save = User.prototype.save.bind(user);
    return user;
  }

  // Helper to hydrate Url objects with required prototype/methods
  function hydrateUrl(url) {
    if (!url) return null;
    url.toObject = Url.prototype.toObject.bind(url);
    url.save = Url.prototype.save.bind(url);
    return url;
  }

  // 1. Mock User model statics and prototype
  User.findOne = async function(query) {
    let lookup = null;
    if (query.$or) {
      const emailQuery = query.$or.find(o => o.email);
      const usernameQuery = query.$or.find(o => o.username);
      lookup = emailQuery ? emailQuery.email : (usernameQuery ? usernameQuery.username : null);
    }
    const email = query.email;
    const username = query.username;
    
    const user = db.users.find(u => 
      (email && u.email === email) ||
      (username && u.username === username) ||
      (lookup && (u.email === lookup || u.username === lookup))
    ) || null;

    return hydrateUser(user);
  };

  User.findById = function(id) {
    if (!id) return null;
    const user = db.users.find(u => u._id.toString() === id.toString()) || null;
    const chain = {
      select: function() { return this; },
      then: function(resolve) {
        resolve(hydrateUser(user));
        return this;
      },
      exec: async function() {
        return hydrateUser(user);
      }
    };
    chain.then = chain.then.bind(chain);
    return chain;
  };

  User.create = async function(data) {
    const user = new User(data);
    user._id = new mongoose.Types.ObjectId();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(data.password, salt);
    
    db.users.push(user);
    saveDB();
    return hydrateUser(user);
  };

  User.prototype.save = async function() {
    const idx = db.users.findIndex(u => u._id.toString() === this._id.toString());

    if (idx >= 0) {
      db.users[idx] = this;
    } else {
      db.users.push(this);
    }
    saveDB();
    return this;
  };

  // 2. Mock Url model statics and prototype
  Url.create = async function(data) {
    const url = new Url(data);
    url._id = new mongoose.Types.ObjectId();
    url.createdAt = new Date();
    url.clickCount = 0;
    url.isActive = true;
    
    db.urls.push(url);
    saveDB();
    return hydrateUrl(url);
  };

  Url.find = function(query) {
    let results = db.urls.filter(u => u.userId.toString() === query.userId.toString());
    
    if (query.$or) {
      const searchItem = query.$or[0].longUrl;
      const searchRegex = searchItem && searchItem.$regex ? searchItem.$regex : '';
      if (searchRegex) {
        results = results.filter(u => 
          u.longUrl.toLowerCase().includes(searchRegex.toLowerCase()) ||
          u.shortCode.toLowerCase().includes(searchRegex.toLowerCase()) ||
          (u.customAlias && u.customAlias.toLowerCase().includes(searchRegex.toLowerCase()))
        );
      }
    }
    
    const chain = {
      sort: function() { return this; },
      skip: function(n) {
        results = results.slice(n);
        return this;
      },
      limit: function(n) {
        results = results.slice(0, n);
        return this;
      },
      then: function(resolve) {
        resolve(results.map(hydrateUrl));
        return this;
      },
      exec: async function() {
        return results.map(hydrateUrl);
      }
    };
    chain.then = chain.then.bind(chain);
    return chain;
  };

  Url.findOne = async function(query) {
    let found = null;
    if (query._id) {
      found = db.urls.find(u => u._id.toString() === query._id.toString());
      if (found && query.userId && found.userId.toString() !== query.userId.toString()) {
        found = null;
      }
    } else if (query.userId && query.$or) {
      const code = query.$or[0].shortCode || query.$or[1].customAlias;
      found = db.urls.find(u => u.userId.toString() === query.userId.toString() && (u.shortCode === code || u.customAlias === code));
    } else if (query.userId) {
      found = db.urls.find(u => u.userId.toString() === query.userId.toString());
    } else if (query.shortCode) {
      found = db.urls.find(u => u.shortCode === query.shortCode);
    } else if (query.customAlias) {
      found = db.urls.find(u => u.customAlias === query.customAlias);
    } else if (query.$or) {
      const code = query.$or[0].customAlias || query.$or[1].shortCode;
      found = db.urls.find(u => u.shortCode === code || u.customAlias === code);
    }
    return hydrateUrl(found);
  };

  Url.countDocuments = async function(query) {
    let results = db.urls.filter(u => u.userId.toString() === query.userId.toString());
    if (query.$or) {
      const searchItem = query.$or[0].longUrl;
      const searchRegex = searchItem && searchItem.$regex ? searchItem.$regex : '';
      if (searchRegex) {
        results = results.filter(u => 
          u.longUrl.toLowerCase().includes(searchRegex.toLowerCase()) ||
          u.shortCode.toLowerCase().includes(searchRegex.toLowerCase()) ||
          (u.customAlias && u.customAlias.toLowerCase().includes(searchRegex.toLowerCase()))
        );
      }
    }
    return results.length;
  };

  Url.findOneAndDelete = async function(query) {
    const idx = db.urls.findIndex(u => u._id.toString() === query._id.toString() && u.userId.toString() === query.userId.toString());
    if (idx >= 0) {
      const deleted = db.urls.splice(idx, 1)[0];
      saveDB();
      return hydrateUrl(deleted);
    }
    return null;
  };

  Url.prototype.save = async function() {
    const idx = db.urls.findIndex(u => u._id.toString() === this._id.toString());
    if (idx >= 0) {
      db.urls[idx] = this;
    } else {
      db.urls.push(this);
    }
    saveDB();
    return this;
  };

  Url.prototype.toObject = function() {
    return JSON.parse(JSON.stringify(this));
  };

  Url.aggregate = async function(pipeline) {
    const match = pipeline[0].$match;
    const userId = match.userId;
    const userUrls = db.urls.filter(u => u.userId.toString() === userId.toString());
    const totalClicks = userUrls.reduce((sum, u) => sum + (u.clickCount || 0), 0);
    return [ { _id: null, totalClicks } ];
  };

  // 3. Mock Analytics model statics and prototype
  Analytics.create = async function(data) {
    const anal = new Analytics(data);
    anal._id = new mongoose.Types.ObjectId();
    anal.timestamp = new Date();
    db.analytics.push(anal);
    saveDB();
    return anal;
  };

  Analytics.deleteMany = async function(query) {
    if (query.urlId) {
      db.analytics = db.analytics.filter(a => a.urlId.toString() !== query.urlId.toString());
      saveDB();
    }
    return { deletedCount: 1 };
  };

  Analytics.find = function(query) {
    let results = db.analytics;
    if (query.userId) {
      results = results.filter(a => a.userId.toString() === query.userId.toString());
    }
    if (query.urlId) {
      results = results.filter(a => a.urlId.toString() === query.urlId.toString());
    }

    const chain = {
      populate: function() { return this; },
      sort: function() { return this; },
      limit: function(n) {
        results = results.slice(0, n);
        return this;
      },
      then: function(resolve) {
        // Mock populate by loading url details
        const enriched = results.map(r => {
          const urlObj = db.urls.find(u => u._id.toString() === r.urlId.toString());
          const item = JSON.parse(JSON.stringify(r));
          if (urlObj) {
            item.urlId = {
              _id: urlObj._id,
              longUrl: urlObj.longUrl,
              shortCode: urlObj.shortCode,
              customAlias: urlObj.customAlias
            };
          }
          return item;
        });
        resolve(enriched);
        return this;
      },
      exec: async function() {
        return results;
      }
    };
    chain.then = chain.then.bind(chain);
    return chain;
  };

  Analytics.aggregate = async function(pipeline) {
    const match = pipeline[0]?.$match;
    if (!match) return [];
    
    let filtered = db.analytics;
    if (match.urlId) {
      filtered = filtered.filter(a => a.urlId.toString() === match.urlId.toString());
    } else if (match.userId) {
      filtered = filtered.filter(a => a.userId.toString() === match.userId.toString());
    }
    
    const group = pipeline[1]?.$group;
    if (!group) return [];
    const groupField = group._id;
    
    const groups = {};
    filtered.forEach(item => {
      let key = 'Unknown';
      if (groupField === '$browser') key = item.browser || 'Unknown';
      else if (groupField === '$device') key = item.device || 'Desktop';
      else if (groupField === '$os') key = item.os || 'Unknown';
      else if (groupField === '$referrer') key = item.referrer || 'Direct';
      else if (groupField === '$location.country') key = item.location?.country || 'Unknown';
      else if (groupField.$dateToString) {
        const date = new Date(item.timestamp);
        key = date.toISOString().split('T')[0];
      }
      
      groups[key] = (groups[key] || 0) + 1;
    });
    
    const results = Object.keys(groups).map(key => ({
      _id: key,
      count: groups[key],
      clicks: groups[key]
    }));
    
    if (pipeline[2] && pipeline[2].$sort) {
      const sortField = Object.keys(pipeline[2].$sort)[0];
      const sortDir = pipeline[2].$sort[sortField];
      results.sort((a, b) => sortDir === -1 ? b.count - a.count : a.count - b.count);
    }
    
    return results;
  };

  console.log('Mongoose models successfully monkey-patched for persistent file-based operations.');
}

module.exports = connectDB;
