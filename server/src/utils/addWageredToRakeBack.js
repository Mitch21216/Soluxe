// Require Dependencies
const User = require("../models/User");

// Update rakeback for users
const addWageredToRakeBack = async (
  userId,
  amount
) => {
  try {
    await User.updateOne(
      { _id: userId },
      {
        $inc: {
          'rakeBack.daily.wagered': amount,
          'rakeBack.weekly.wagered': amount,
          'rakeBack.monthly.wagered': amount
        }
      }
    );
  } catch (error) {
    console.error("Error while adding wagered to rakeback user", userId, amount, error)
    throw new Error("Failed to update wagered to rakeback user", userId, amount)
  }
}

// Export function
module.exports = addWageredToRakeBack;
