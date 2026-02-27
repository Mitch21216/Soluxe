// Require Dependencies
const mongoose = require("mongoose");
const SchemaTypes = mongoose.Schema.Types;

// Setup Race Schema
const RaffleSchema = new mongoose.Schema({
  // Basic fields
  prize: Number,
  type: String,
  endingDate: Number,

  // Race winners
  winner: {
    type: {
      type: SchemaTypes.ObjectId,
      ref: "User",
    },
    default: undefined,
  },

  // When race was created
  created: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the new model
const Raffle = (module.exports = mongoose.model("Raffle", RaffleSchema));
