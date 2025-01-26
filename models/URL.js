const mongoose = require("mongoose");

const URLSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortenedCode: {
    type: String,
    required: true,
    unique: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("URL", URLSchema);
