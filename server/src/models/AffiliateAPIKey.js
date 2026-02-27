// Require Dependencies
const mongoose = require("mongoose");
const SchemaTypes = mongoose.Schema.Types;

// Tracks each time a user earned another user affiliate money, this is for the affiliates API so we can aggregate with $group of userId and $sum the totalBet
const AffiliateAPIKeySchema = new mongoose.Schema({
  // Authentication related fields
  userId: {
    type: SchemaTypes.ObjectId,
    ref: "User",
    default: null,
  },

  key: {
    type: String,
    required: true,
  },

  enabled: {
    type: Boolean,
    default: true,
  },

  requests: {
    type: Number,
    default: 0,
  },

  // When user was created (registered)
  created: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the new model
const User = (module.exports = mongoose.model("AffiliateAPIKey", AffiliateAPIKeySchema));
