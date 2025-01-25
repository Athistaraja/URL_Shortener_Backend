const mongoose = require('mongoose');

const URLSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required'],
  },
  shortenedCode: {
    type: String,
    required: [true, 'Shortened code is required'],
    unique: true,
  },
});

const URL = mongoose.model('URL', URLSchema);
module.exports = URL;
