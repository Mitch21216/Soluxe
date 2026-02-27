// Require Dependencies
const mongoose = require("mongoose");
const SchemaTypes = mongoose.Schema.Types;

// Setup User Schema
const AffiliateUserSchema = new mongoose.Schema({
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

  totalDeposited: {
    type: Number,
    default: 0,
  },

  totalBet: {
    type: Number,
    default: 0,
  },

  totalEarned: {
    type: Number,
    default: 0,
  },

  active: {
    type: Boolean,
    default: true,
  },

  lastActive: {
    type: Date,
    default: Date.now,
  },

  // When user was created (registered)
  created: {
    type: Date,
    default: Date.now,
  },
}, { strict: false });

// Create and export the new model
const User = (module.exports = mongoose.model("AffiliateUser", AffiliateUserSchema));
