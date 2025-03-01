const express = require('express');
const router = express.Router();
const shortid = require('shortid');
const URL = require('../models/URL');

// URL validation function
const isValidUrl = (url) => {
  const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
  return urlRegex.test(url);
};

// POST: Shorten URL
router.post('/api/shorten', async (req, res) => {
  const { originalUrl, customCode } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  if (!isValidUrl(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    const existingUrl = await URL.findOne({ originalUrl });
    if (existingUrl) {
      return res.status(200).json({
        message: 'URL already shortened',
        shortenedUrl: `https://url-shortener-backend-lyqr.onrender.com/${existingUrl.shortenedCode}`,
      });
    }

    let shortenedCode = customCode || shortid.generate();

    const existingCode = await URL.findOne({ shortenedCode });
    if (existingCode) {
      return res.status(400).json({ error: 'Custom code is already in use' });
    }

    const newURL = new URL({ originalUrl, shortenedCode });
    await newURL.save();

    res.json({
      message: 'URL shortened successfully',
      shortenedUrl: `https://url-shortener-backend-lyqr.onrender.com/${shortenedCode}`,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT: Edit a shortened code
router.put('/api/edit/:shortenedCode', async (req, res) => {
  const { shortenedCode } = req.params;
  const { newCode } = req.body;

  if (!newCode) {
    return res.status(400).json({ error: 'New code is required' });
  }

  try {
    const codeExists = await URL.findOne({ shortenedCode: newCode });
    if (codeExists) {
      return res.status(400).json({ error: 'New code is already in use' });
    }

    const updatedURL = await URL.findOneAndUpdate(
      { shortenedCode },
      { shortenedCode: newCode },
      { new: true }
    );

    if (!updatedURL) {
      return res.status(404).json({ error: 'Shortened code not found' });
    }

    res.json({
      message: 'Shortened code updated successfully',
      updatedUrl: `http://localhost:5000/${newCode}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Redirect to the original URL
router.get('/:shortenedCode', async (req, res) => {
  const { shortenedCode } = req.params;

  try {
    const url = await URL.findOne({ shortenedCode });
    if (!url) {
      return res.status(404).json({ error: 'URL not found' });
    }

    url.clicks += 1;
    await url.save();

    res.redirect(url.originalUrl);
  } catch (err) {
    console.error('Error during redirection:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
