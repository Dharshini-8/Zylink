const Url = require('../models/Url');
const Analytics = require('../models/Analytics');
const { generateRandomCode, isValidUrl } = require('../utils/helpers');
const generateQRCode = require('../utils/qrCodeGenerator');

// @desc    Create a short URL
// @route   POST /api/urls
// @access  Private
exports.createUrl = async (req, res, next) => {
  try {
    const { longUrl, customAlias, expiryDate, isPublicAnalytics } = req.body;

    if (!longUrl) {
      return res.status(400).json({ success: false, error: 'Original URL is required' });
    }

    if (!isValidUrl(longUrl)) {
      return res.status(400).json({ success: false, error: 'Invalid URL format. Must start with http:// or https://' });
    }

    let shortCode = generateRandomCode();
    // Ensure uniqueness
    let exists = await Url.findOne({ shortCode });
    while (exists) {
      shortCode = generateRandomCode();
      exists = await Url.findOne({ shortCode });
    }

    let alias = null;
    if (customAlias) {
      alias = customAlias.trim().toLowerCase();
      // Validate alias format
      if (!/^[a-zA-Z0-9-_]+$/.test(alias)) {
        return res.status(400).json({ success: false, error: 'Custom alias can only contain alphanumeric characters, hyphens, and underscores' });
      }
      // Reserved alias check
      const reserved = ['api', 'auth', 'static', 'dashboard', 'admin', 'login', 'register', 'logout', 'analytics', 'links'];
      if (reserved.includes(alias)) {
        return res.status(400).json({ success: false, error: `Alias "${alias}" is a reserved word and cannot be used` });
      }

      const aliasExists = await Url.findOne({
        $or: [
          { customAlias: alias },
          { shortCode: alias }
        ]
      });
      if (aliasExists) {
        return res.status(400).json({ success: false, error: 'Custom alias is already in use' });
      }
    }

    const finalCode = alias || shortCode;
    const host = req.get('host');
    const shortUrlString = `${req.protocol}://${host}/${req.user.username}/${finalCode}`;
    const qrCode = await generateQRCode(shortUrlString);

    const urlData = {
      userId: req.user._id,
      longUrl,
      shortCode,
      qrCode,
      isPublicAnalytics: !!isPublicAnalytics
    };

    if (alias) {
      urlData.customAlias = alias;
    }
    if (expiryDate) {
      urlData.expiryDate = new Date(expiryDate);
    }

    const url = await Url.create(urlData);

    res.status(201).json({
      success: true,
      url: {
        ...url.toObject(),
        shortUrl: shortUrlString
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's URLs
// @route   GET /api/urls
// @access  Private
exports.getUrls = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { longUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
        { customAlias: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Url.countDocuments(query);
    const urls = await Url.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const host = req.get('host');
    const enrichedUrls = urls.map(url => {
      const code = url.customAlias || url.shortCode;
      const shortUrl = `${req.protocol}://${host}/${req.user.username}/${code}`;
      return {
        ...url.toObject(),
        shortUrl
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedUrls.length,
      total,
      pages: Math.ceil(total / limit),
      urls: enrichedUrls
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single URL
// @route   GET /api/urls/:id
// @access  Private
exports.getUrl = async (req, res, next) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ success: false, error: 'URL not found or unauthorized' });
    }

    const host = req.get('host');
    const code = url.customAlias || url.shortCode;
    const shortUrl = `${req.protocol}://${host}/${req.user.username}/${code}`;

    res.status(200).json({
      success: true,
      url: {
        ...url.toObject(),
        shortUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update URL
// @route   PUT /api/urls/:id
// @access  Private
exports.updateUrl = async (req, res, next) => {
  try {
    const { longUrl, customAlias, expiryDate, isActive, isPublicAnalytics } = req.body;
    let url = await Url.findOne({ _id: req.params.id, userId: req.user._id });

    if (!url) {
      return res.status(404).json({ success: false, error: 'URL not found or unauthorized' });
    }

    if (longUrl) {
      if (!isValidUrl(longUrl)) {
        return res.status(400).json({ success: false, error: 'Invalid URL format. Must start with http:// or https://' });
      }
      url.longUrl = longUrl;
    }

    if (customAlias !== undefined) {
      if (customAlias === null || customAlias === '') {
        url.customAlias = undefined;
      } else {
        const alias = customAlias.trim().toLowerCase();
        if (!/^[a-zA-Z0-9-_]+$/.test(alias)) {
          return res.status(400).json({ success: false, error: 'Custom alias can only contain alphanumeric characters, hyphens, and underscores' });
        }
        
        const reserved = ['api', 'auth', 'static', 'dashboard', 'admin', 'login', 'register', 'logout', 'analytics', 'links'];
        if (reserved.includes(alias)) {
          return res.status(400).json({ success: false, error: `Alias "${alias}" is a reserved word and cannot be used` });
        }

        if (alias !== url.customAlias) {
          const aliasExists = await Url.findOne({
            _id: { $ne: url._id },
            $or: [
              { customAlias: alias },
              { shortCode: alias }
            ]
          });
          if (aliasExists) {
            return res.status(400).json({ success: false, error: 'Custom alias is already in use' });
          }
          url.customAlias = alias;
        }
      }
    }

    if (expiryDate !== undefined) {
      url.expiryDate = expiryDate ? new Date(expiryDate) : undefined;
    }

    if (isActive !== undefined) {
      url.isActive = !!isActive;
    }

    if (isPublicAnalytics !== undefined) {
      url.isPublicAnalytics = !!isPublicAnalytics;
    }

    // Regenerate QR Code
    const host = req.get('host');
    const finalCode = url.customAlias || url.shortCode;
    const shortUrlString = `${req.protocol}://${host}/${req.user.username}/${finalCode}`;
    url.qrCode = await generateQRCode(shortUrlString);

    await url.save();

    res.status(200).json({
      success: true,
      url: {
        ...url.toObject(),
        shortUrl: shortUrlString
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete URL
// @route   DELETE /api/urls/:id
// @access  Private
exports.deleteUrl = async (req, res, next) => {
  try {
    const url = await Url.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!url) {
      return res.status(404).json({ success: false, error: 'URL not found or unauthorized' });
    }

    // Delete associated analytics
    await Analytics.deleteMany({ urlId: url._id });

    res.status(200).json({ success: true, message: 'URL and its analytics deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk Shorten URLs
// @route   POST /api/urls/bulk
// @access  Private
exports.bulkShorten = async (req, res, next) => {
  try {
    let list = [];
    
    if (req.body.csvText) {
      const lines = req.body.csvText.split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        const [rawUrl, rawAlias, rawExpiry] = line.split(',');
        
        if (rawUrl && rawUrl.toLowerCase().trim() !== 'url') {
          list.push({
            longUrl: rawUrl.trim(),
            customAlias: rawAlias && rawAlias.trim() ? rawAlias.trim() : undefined,
            expiryDate: rawExpiry && rawExpiry.trim() ? rawExpiry.trim() : undefined
          });
        }
      }
    } else if (Array.isArray(req.body.urls)) {
      list = req.body.urls;
    } else {
      return res.status(400).json({ success: false, error: 'Please provide urls array or csvText' });
    }

    if (list.length === 0) {
      return res.status(400).json({ success: false, error: 'No URLs provided for shortening' });
    }

    const host = req.get('host');
    const results = [];

    for (const item of list) {
      const { longUrl, customAlias, expiryDate } = item;

      if (!longUrl || !isValidUrl(longUrl)) {
        results.push({ longUrl, success: false, error: 'Invalid URL format' });
        continue;
      }

      let shortCode = generateRandomCode();
      let exists = await Url.findOne({ shortCode });
      while (exists) {
        shortCode = generateRandomCode();
        exists = await Url.findOne({ shortCode });
      }

      let alias = null;
      if (customAlias) {
        const cleanedAlias = customAlias.trim().toLowerCase();
        const reserved = ['api', 'auth', 'static', 'dashboard', 'admin', 'login', 'register', 'logout', 'analytics', 'links'];
        const formatOk = /^[a-zA-Z0-9-_]+$/.test(cleanedAlias);
        const isReserved = reserved.includes(cleanedAlias);
        
        if (formatOk && !isReserved) {
          const aliasExists = await Url.findOne({
            $or: [
              { customAlias: cleanedAlias },
              { shortCode: cleanedAlias }
            ]
          });
          if (!aliasExists) {
            alias = cleanedAlias;
          }
        }
      }

      const finalCode = alias || shortCode;
      const shortUrlString = `${req.protocol}://${host}/${req.user.username}/${finalCode}`;
      const qrCode = await generateQRCode(shortUrlString);

      const urlData = {
        userId: req.user._id,
        longUrl,
        shortCode,
        qrCode
      };

      if (alias) {
        urlData.customAlias = alias;
      }
      if (expiryDate) {
        const parsedDate = new Date(expiryDate);
        if (!isNaN(parsedDate.getTime())) {
          urlData.expiryDate = parsedDate;
        }
      }

      try {
        const newUrl = await Url.create(urlData);
        results.push({
          longUrl,
          success: true,
          url: {
            ...newUrl.toObject(),
            shortUrl: shortUrlString
          }
        });
      } catch (err) {
        results.push({ longUrl, success: false, error: err.message });
      }
    }

    res.status(200).json({ success: true, results });
  } catch (error) {
    next(error);
  }
};
