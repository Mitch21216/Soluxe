// Require Dependencies
const mongoose = require("mongoose");
const SchemaTypes = mongoose.Schema.Types;

// Setup Race Schema
const RaffleEntrySchema = new mongoose.Schema({
  amount: Number,
  raffle: {
    type: {
      type: SchemaTypes.ObjectId,
      ref: "Raffle",
    },
  },
  user: {
    type: {
      type: SchemaTypes.ObjectId,
      ref: "User",
    },
  },
});

// Create and export the new model
const RaffleEntry = (module.exports = mongoose.model("RaffleEntry", RaffleEntrySchema));
