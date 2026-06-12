const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  longUrl: {
    type: String,
    required: [true, 'Original URL is required'],
    trim: true
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customAlias: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    index: true
  },
  qrCode: {
    type: String // Base64 Data URI
  },
  expiryDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  clickCount: {
    type: Number,
    default: 0
  },
  lastVisitedAt: {
    type: Date
  },
  isPublicAnalytics: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Url', urlSchema);
