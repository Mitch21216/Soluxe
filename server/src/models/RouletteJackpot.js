// Require Dependencies
const mongoose = require("mongoose");

// Setup RouletteGame Schema
const RouletteJackpotSchema = new mongoose.Schema({
  amount: {
    type: Number,
    default: 0
  },

  participations: Array,

  state: {
    type: Number,
    default: 0
  },

  created: {
    type: Date,
    default: Date.now
  },
});

// Create and export the new model
const RouletteJackpot = (module.exports = mongoose.model(
  "RouletteJackpot",
  RouletteJackpotSchema
));
