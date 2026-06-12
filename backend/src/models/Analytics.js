const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  browser: {
    type: String,
    default: 'Unknown'
  },
  device: {
    type: String,
    default: 'Desktop'
  },
  os: {
    type: String,
    default: 'Unknown'
  },
  referrer: {
    type: String,
    default: 'Direct'
  },
  location: {
    country: { type: String, default: 'Unknown' },
    city: { type: String, default: 'Unknown' },
    region: { type: String, default: 'Unknown' }
  }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
