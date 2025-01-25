const express = require('express');
const mongoose = require('mongoose');
const URL = require("./models/URL")
const shortid = require('shortid');
const cors = require('cors');

const { configDotenv } = require('dotenv');
configDotenv();



const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors());


const MONGO_URI = process.env.MONGO_URI

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('MongoDB connection error:', err));

// post Shortener URL 
app.post('/api/shorten', async (req, res) => {
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

// Put Method use to customise a URl 
app.put('/api/edit/:shortenedCode', async (req, res) => {
  const { shortenedCode } = req.params;
  const { newCode } = req.body;

  if (!newCode) {
    return res.status(400).json({ error: 'New code is required' });
  }

  try {
    // Check if the new code is already taken
    const codeExists = await URL.findOne({ shortenedCode: newCode });
    if (codeExists) {
      return res.status(400).json({ error: 'New code is already in use' });
    }

    // Find the existing record and update it
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


app.get("/", (req, res) => {
  res.send(" Welcomme to URl shortener API")
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
