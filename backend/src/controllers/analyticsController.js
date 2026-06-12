const Url = require('../models/Url');
const Analytics = require('../models/Analytics');
const User = require('../models/User');

// @desc    Get dashboard summary statistics
// @route   GET /api/analytics/summary
// @access  Private
exports.getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Total URLs
    const totalLinks = await Url.countDocuments({ userId });

    // Active URLs
    const activeLinks = await Url.countDocuments({ userId, isActive: true });

    // Total Clicks (sum of clickCount across all user's URLs)
    const clicksResult = await Url.aggregate([
      { $match: { userId } },
      { $group: { _id: null, totalClicks: { $sum: '$clickCount' } } }
    ]);
    const totalClicks = clicksResult.length > 0 ? clicksResult[0].totalClicks : 0;

    // Recent clicks log (last 5 analytics records)
    const recentActivity = await Analytics.find({ userId })
      .populate('urlId', 'longUrl shortCode customAlias')
      .sort({ timestamp: -1 })
      .limit(5);

    // Click trend for the last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const clickTrend = await Analytics.aggregate([
      {
        $match: {
          userId,
          timestamp: { $gte: fourteenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing dates with 0 clicks
    const trendMap = new Map();
    clickTrend.forEach(item => trendMap.set(item._id, item.clicks));

    const enrichedTrend = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      enrichedTrend.push({
        date: dateStr,
        clicks: trendMap.get(dateStr) || 0
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalLinks,
        activeLinks,
        totalClicks,
        recentActivity,
        clickTrend: enrichedTrend
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to extract specific URL analytics breakdown
const getDetailedStats = async (urlId, userId) => {
  const url = await Url.findOne({ _id: urlId, ...(userId ? { userId } : {}) });
  if (!url) return null;

  // Total Click Count from DB model (or computed logs)
  const totalClicks = url.clickCount;
  const lastVisitTime = url.lastVisitedAt || null;

  // Analytics Logs (last 100)
  const recentVisits = await Analytics.find({ urlId })
    .sort({ timestamp: -1 })
    .limit(100);

  // Group by Browser
  const browsers = await Analytics.aggregate([
    { $match: { urlId } },
    { $group: { _id: '$browser', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Group by Device
  const devices = await Analytics.aggregate([
    { $match: { urlId } },
    { $group: { _id: '$device', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Group by OS
  const os = await Analytics.aggregate([
    { $match: { urlId } },
    { $group: { _id: '$os', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Group by Referrer
  const referrers = await Analytics.aggregate([
    { $match: { urlId } },
    { $group: { _id: '$referrer', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Group by Location Country
  const locations = await Analytics.aggregate([
    { $match: { urlId } },
    { $group: { _id: '$location.country', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Group click trend for the last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  fourteenDaysAgo.setHours(0, 0, 0, 0);

  const clickTrend = await Analytics.aggregate([
    {
      $match: {
        urlId,
        timestamp: { $gte: fourteenDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          clicks: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const trendMap = new Map();
    clickTrend.forEach(item => trendMap.set(item._id, item.clicks));

    const dailyTrend = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyTrend.push({
        date: dateStr,
        clicks: trendMap.get(dateStr) || 0
      });
    }

  return {
    urlInfo: {
      id: url._id,
      longUrl: url.longUrl,
      shortCode: url.shortCode,
      customAlias: url.customAlias,
      qrCode: url.qrCode,
      expiryDate: url.expiryDate,
      isActive: url.isActive,
      isPublicAnalytics: url.isPublicAnalytics,
      createdAt: url.createdAt
    },
    metrics: {
      totalClicks,
      lastVisitTime,
      recentVisits,
      browsers,
      devices,
      os,
      referrers,
      locations,
      dailyTrend
    }
  };
};

// @desc    Get detailed analytics for a specific URL
// @route   GET /api/analytics/url/:id
// @access  Private
exports.getUrlAnalytics = async (req, res, next) => {
  try {
    const stats = await getDetailedStats(req.params.id, req.user._id);
    if (!stats) {
      return res.status(404).json({ success: false, error: 'URL not found or unauthorized' });
    }

    // Enrich short URL
    const host = req.get('host');
    const code = stats.urlInfo.customAlias || stats.urlInfo.shortCode;
    stats.urlInfo.shortUrl = `${req.protocol}://${host}/${req.user.username}/${code}`;

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public analytics for a URL if enabled
// @route   GET /api/analytics/public/:username/:code
// @access  Public
exports.getPublicAnalytics = async (req, res, next) => {
  try {
    const { username, code } = req.params;

    // Find User
    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Find URL
    const url = await Url.findOne({
      userId: user._id,
      $or: [
        { shortCode: code },
        { customAlias: code }
      ]
    });

    if (!url) {
      return res.status(404).json({ success: false, error: 'Short link not found' });
    }

    if (!url.isPublicAnalytics) {
      return res.status(403).json({ success: false, error: 'Analytics for this link are not public' });
    }

    const stats = await getDetailedStats(url._id, null);

    // Enrich short URL
    const host = req.get('host');
    stats.urlInfo.shortUrl = `${req.protocol}://${host}/${user.username}/${code}`;

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
