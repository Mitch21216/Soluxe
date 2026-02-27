// Require Dependencies
const mongoose = require("mongoose");
const SchemaTypes = mongoose.Schema.Types;

// Tracks each time a user earned another user affiliate money, this is for the affiliates API so we can aggregate with $group of userId and $sum the totalBet
const AffiliateEarningSchema = new mongoose.Schema({
  // Authentication related fields
  userId: {
    type: SchemaTypes.ObjectId,
    ref: "User",
    default: null,
    index: true,
  },

  affiliatedBy: {
    type: SchemaTypes.ObjectId,
    ref: "User",
    default: null,
    index: true,
  },

  totalBet: {
    type: Number,
    default: 0,
  },

  totalEarned: {
    type: Number,
    default: 0,
  },

  totalDeposited: {
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
const User = (module.exports = mongoose.model("AffiliateEarning", AffiliateEarningSchema));
