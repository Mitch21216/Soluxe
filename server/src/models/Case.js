// Require Dependencies
const mongoose = require("mongoose");
const SchemaTypes = mongoose.SchemaTypes;

// Setup BattlesGame Schema
const CaseSchema = new mongoose.Schema({
  slug: String,
  name: String,
  image: String,
  price: Number,
  items: [{ type: Object }],

  // When case was created
  created: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the new model
const Cases = (module.exports = mongoose.model("Case", CaseSchema));
