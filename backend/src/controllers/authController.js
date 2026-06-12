const User = require('../models/User');
const jwt = require('jsonwebtoken');

const RESERVED_USERNAMES = ['api', 'auth', 'static', 'dashboard', 'admin', 'login', 'register', 'logout', 'analytics', 'links'];

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecurezylinksecretkey123!', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    const lowerUsername = username.toLowerCase().trim();
    if (RESERVED_USERNAMES.includes(lowerUsername)) {
      return res.status(400).json({ success: false, error: `Username "${username}" is reserved and cannot be used.` });
    }

    const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const usernameExists = await User.findOne({ username: lowerUsername });
    if (usernameExists) {
      return res.status(400).json({ success: false, error: 'Username already taken' });
    }

    const user = await User.create({
      username: lowerUsername,
      email: email.toLowerCase().trim(),
      password
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email/username and password' });
    }

    const lookup = emailOrUsername.toLowerCase().trim();
    const user = await User.findOne({
      $or: [
        { email: lookup },
        { username: lookup }
      ]
    });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.me = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
      }
    });
  } catch (error) {
    next(error);
  }
};
