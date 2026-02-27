// Require Dependencies
const mongoose = require("mongoose");

// Setup JackpotRaffle Schema
const JackpotRaffleSchema = new mongoose.Schema({
  // Basic fields
  winner: Object,
  prize: Number,

  // Provably Fair fields
  privateSeed: String,
  privateHash: String,
  publicSeed: {
    type: String,
    default: null,
  },

  randomModule: {
    type: Number,
    default: null,
  },

  // When game was created
  created: {
    type: Date,
    default: Date.now,
  },

  end: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the new model
const JackpotRaffle = (module.exports = mongoose.model(
  "JackpotRaffle",
  JackpotRaffleSchema
));
