// Require Dependencies
const User = require("../models/User");
const AffiliateUser = require("../models/AffiliateUser");
const AffiliateEarning = require("../models/AffiliateEarning");
const config = require("../config");

// Give affiliator his cut of wager
async function checkAndApplyAffiliatorCut(userId, houseRake, totalBet) {
  try {
    const user = await User.findOne({ _id: userId });

      if (!user) {
      // User not found
      resolve();
      return;
    }

    // Find the affiliator
    const affiliator = await User.findOne({ _id: user._affiliatedBy });

    // If user has affiliator
    if (affiliator) {
      // Update document
      const affiliateEarnings = houseRake * (config.games.affiliates.earningPercentage / 100)

      await User.updateOne(
        { _id: affiliator.id },
        {
          $inc: {
            affiliateMoney: affiliateEarnings,
          },
        }
      );

      await AffiliateUser.updateOne(
        {
          userId,
          affiliatedBy: user._affiliatedBy,            
        },
        {
          $inc: {
            totalBet,
            totalEarned: affiliateEarnings,
          },
          $set: {
            lastActive: Date.now(),
            active: true,
          },
        },
        {
          upsert: true,
        }
      )

      await AffiliateEarning.create(
        {
          userId,
          affiliatedBy: user._affiliatedBy,      
          totalBet,
          totalEarned: affiliateEarnings,      
        },
      )

      return
    } else {
      return
    }
  } catch (error) {
    console.error(error)
    return error
  }
}

async function checkAndApplyAffiliatorDeposit(userId, totalDeposited) {
  try {
    const user = await User.findOne({ _id: userId });

      if (!user) {
      // User not found
      resolve();
      return;
    }

    // Find the affiliator
    const affiliator = await User.findOne({ _id: user._affiliatedBy });

    // If user has affiliator
    if (affiliator) {
      await AffiliateUser.updateOne(
        {
          userId,
          affiliatedBy: user._affiliatedBy,            
        },
        {
          $inc: {
            totalDeposited: totalDeposited,
          },
          $set: {
            lastActive: Date.now(),
            active: true,
          },
        },
        {
          upsert: true,
        }
      )

      await AffiliateEarning.create(
        {
          userId,
          affiliatedBy: user._affiliatedBy,      
          totalDeposited,      
        },
      )

      return
    } else {
      return
    }
  } catch (error) {
    console.error(error)
    return error
  }
}

// Export functions
module.exports = { 
  checkAndApplyAffiliatorCut,
  checkAndApplyAffiliatorDeposit,
};
