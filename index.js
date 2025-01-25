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

// post Shortener 
app.post('/api/shorten', async (req, res) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'Original URL is required' });
  }

  try {
    const shortenedCode = shortid.generate();
    const newURL = new URL({ originalUrl, shortenedCode });
    await newURL.save();

    res.json({ shortenedUrl: `http://localhost:5000/${shortenedCode}` });
  } catch (err) {
    console.error('Error:', err);
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
