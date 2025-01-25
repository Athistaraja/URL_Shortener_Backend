const express = require('express');
const router = express.Router();
const shortid = require('shortid'); // Add this to generate random codes
const URL = require('../models/URL'); // Assuming you have a URL model defined

// POST Shortener URL
router.post('/api/shorten', async (req, res) => {
  const { originalUrl, customCode } = req.body;

  // Validate input
  if (!originalUrl) {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  let shortenedCode = customCode || shortid.generate(); // Use custom code if provided

  try {
    // Check if the custom code already exists
    const existingCode = await URL.findOne({ shortenedCode });
    if (existingCode) {
      return res.status(400).json({ error: 'Custom code is already in use' });
    }

    // Save the new URL to the database
    const newURL = new URL({ originalUrl, shortenedCode });
    await newURL.save();

    res.json({
      message: 'URL shortened successfully',
      shortenedUrl: `http://localhost:5000/${shortenedCode}`,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; // Export the router
