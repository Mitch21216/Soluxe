// Require Dependencies
const express = require("express");
const router = (module.exports = express.Router());
const {
  validateJWT
} = require("../middleware/auth");
const config = require("../config");
const { ObjectId } = require('mongodb')

const AffiliateEarningSchema = require("../models/AffiliateEarning");
const AffiliateUserSchema = require("../models/AffiliateUser");
const AffiliateAPIKeySchema = require('../models/AffiliateAPIKey')

const limitMap = new Set()
const cooldown = 15000
const timeouts = {}

function isLimited(key) {
  if (limitMap.has(key)) return true
  limitMap.add(key)
  if (timeouts[key]) clearTimeout(timeouts[key])
  timeouts[key] = setTimeout(() => limitMap.delete(key), cooldown)
  return false
}

/**
 * @route   GET /api/affiliates/
 * @desc    Get affiliate data aggregated
 * @access  Public`
 */
router.get("/", async (req, res, next) => {
  try {
    const key = req.query.key

    let start = -1
    let end = -1

    console.log(req.query.start, +req.query.start)
    if (typeof key !== 'string' || key.length < 1) return res.json({ success: false, message: 'Invalid API Key' });
    if (typeof req.query.start === 'string' && !isNaN(+req.query.start) && req.query.start > 0) start = Math.floor(+req.query.start)
    if (typeof req.query.end === 'string' && !isNaN(+req.query.end) && req.query.end > 0 && req.query.end > start) end = Math.floor(+req.query.end)

    if (isLimited(key)) return res.json({ success: false, message: 'You are being ratelimited, you can only call this endpoint once every 15 seconds.' })

    const apiKeyData = await AffiliateAPIKeySchema.findOne({ key })
    if (!apiKeyData) return res.json({ success: false, message: 'Invalid API Key' });

    // Would be lifetime
    if (start === -1 && end === -1) return res.json({ success: true, users: await AffiliateUserSchema.find({ affiliatedBy: apiKeyData.userId }) })

    const startObjId = objectIdFromDate(start > 0 ? start : 0)
    const endObjId = objectIdFromDate(end > 0 ? end : Date.now())

    let userData = await AffiliateEarningSchema.aggregate([
      {
        $match: {
          _id: { $gte: startObjId, $lte: endObjId },
          affiliatedBy: apiKeyData.userId,
        },
      },
      {
        $group: {
          _id: '$userId',

          totalBet: {
            $sum: '$totalBet',
          },

          totalEarned: {
            $sum: '$totalEarned',
          },

          totalDeposited: {
            $sum: '$totalDeposited',
          },
        },
      },
      {
        $sort: {
          'totalBet': -1
        }
      }
    ])

    return res.json({ success: true, users: userData });
  } catch (error) {
    return next(error);
  }
});

function objectIdFromDate(ms) {
  return new ObjectId(Math.floor(ms / 1000).toString(16) + "0000000000000000");
};