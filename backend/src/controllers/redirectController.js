const Url = require('../models/Url');
const User = require('../models/User');
const Analytics = require('../models/Analytics');
const useragent = require('useragent');

const COUNTRIES = ['United States', 'United Kingdom', 'India', 'Germany', 'Canada', 'France', 'Australia', 'Japan', 'Singapore'];
const CITIES = {
  'United States': ['New York', 'San Francisco', 'Seattle'],
  'United Kingdom': ['London', 'Manchester', 'Edinburgh'],
  'India': ['Bangalore', 'Mumbai', 'New Delhi'],
  'Germany': ['Berlin', 'Munich', 'Frankfurt'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal'],
  'France': ['Paris', 'Lyon', 'Marseille'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane'],
  'Japan': ['Tokyo', 'Osaka', 'Kyoto'],
  'Singapore': ['Singapore', 'Singapore', 'Singapore']
};

const getRandomLocation = () => {
  const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  const cityList = CITIES[country] || ['Unknown'];
  const city = cityList[Math.floor(Math.random() * cityList.length)];
  return { country, city, region: 'Default' };
};

const getReferrerName = (refHeader) => {
  if (!refHeader) return 'Direct';
  try {
    const url = new URL(refHeader);
    let hostname = url.hostname.replace('www.', '');
    // Capitalize domain
    return hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
  } catch (e) {
    return 'Direct';
  }
};

// @desc    Redirect short URL to long URL
// @route   GET /:username/:code
// @access  Public
exports.redirectToUrl = async (req, res, next) => {
  try {
    const { username, code } = req.params;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // 1. Find the User
    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.redirect(`${frontendUrl}/404?error=UserNotFound`);
    }

    // 2. Find the URL
    const url = await Url.findOne({
      userId: user._id,
      $or: [
        { shortCode: code },
        { customAlias: code }
      ]
    });

    if (!url) {
      return res.redirect(`${frontendUrl}/404?error=LinkNotFound`);
    }

    // 3. Check if active
    if (!url.isActive) {
      return res.redirect(`${frontendUrl}/expired?error=LinkInactive`);
    }

    // 4. Check if expired
    if (url.expiryDate && new Date() > url.expiryDate) {
      url.isActive = false;
      await url.save();
      return res.redirect(`${frontendUrl}/expired?error=LinkExpired`);
    }

    // 5. Track visit
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ua = req.headers['user-agent'] || '';
    const agent = useragent.parse(ua);
    
    const browser = agent.family === 'Other' ? 'Unknown Browser' : agent.family;
    const os = agent.os.family === 'Other' ? 'Unknown OS' : agent.os.family;

    let device = 'Desktop';
    if (/tablet|ipad|playbook|silk/i.test(ua)) {
      device = 'Tablet';
    } else if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|webos/i.test(ua)) {
      device = 'Mobile';
    }

    const referrer = getReferrerName(req.get('referrer'));
    const location = getRandomLocation(); // Simulated geo-location lookup for local dev testing

    // Log analytics
    await Analytics.create({
      urlId: url._id,
      userId: user._id,
      ip,
      userAgent: ua,
      browser,
      device,
      os,
      referrer,
      location
    });

    // Update url statistics
    url.clickCount += 1;
    url.lastVisitedAt = new Date();
    await url.save();

    // 6. Redirect
    return res.redirect(url.longUrl);
  } catch (error) {
    next(error);
  }
};
