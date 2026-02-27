// Require Dependencies
const express = require("express");
const router = (module.exports = express.Router());
const crypto = require('crypto')

const APIKeySchema = require("../../../models/AffiliateAPIKey");

/**
 * @route   GET /api/external/v1/affiliates/keys/list
 * @desc    List all API keys
 * @access  Private
 */
router.get("/keys/list", async (req, res, next) => {
  try {
    const apiKeys = await APIKeySchema.find().sort({ _id: -1 });

    return res.json(
      {
        success: true,
        data: apiKeys,
      }
    );
  } catch (error) {
    return next(error);
  }
});

router.post("/keys/create", async (req, res, next) => {
  try {
    const apiKeys = await APIKeySchema.find().sort({ _id: -1 });

    return res.json(
      {
        success: true,
        data: apiKeys,
      }
    );
  } catch (error) {
    return next(error);
  }
});