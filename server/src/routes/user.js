// Require Dependencies
const express = require("express");
const router = (module.exports = express.Router());
const rateLimit = require("express-rate-limit");
const { check, validationResult } = require("express-validator");
const { validateJWT } = require("../middleware/auth");
const {
  sendVerficationTextMessage,
  verifyTextMessageCode,
} = require("../controllers/twilio");
const { checkInventoryForLoyaltyBadge } = require("../controllers/steam");
const config = require("../config");
const insertNewWalletTransaction = require("../utils/insertNewWalletTransaction");
const { checkMaintenance } = require("../middleware/maintenance");
const { verifyRecaptchaResponse } = require("../controllers/recaptcha");

const User = require("../models/User");
const AffiliateUser = require("../models/AffiliateUser");
const WalletTransaction = require("../models/WalletTransaction");
const CoinflipGame = require("../models/CoinflipGame");
const CrashGame = require("../models/CrashGame");
const JackpotGame = require("../models/JackpotGame");
const RouletteGame = require("../models/RouletteGame");
const WheelGame = require("../models/WheelGame");
const defaultRakeBackObject = require("../utils/defaultRakeBackObject");

// Create request limiter
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1, // limit each IP to 100 requests per windowMs
  message: {
    error: "You can do this only every 5 minutes. Please wait",
    stack: {},
  },
});

// Combine middleware
const middleware = [checkMaintenance, validateJWT];

/**
 * @route   GET /api/user/
 * @desc    Get authenticated user
 * @access  Private
 */
router.get("/", validateJWT, async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user.id }).select({
      crypto: 0,
      phoneVerificationCode: 0,
    });

    // Check that user exists
    if (!user) {
      console.error("User not found, maybe database did an oopsie?");
      return next(new Error("User not found, maybe database did an oopsie?"));
    }
    return res.json({
      user,
      token: req.authToken,
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @route   GET /api/user/history
 * @desc    Get authenticated user's games history
 * @access  Private
 */
router.get("/history", middleware, async (req, res, next) => {
  try {
    // Get user
    const user = await User.findOne({ _id: req.user.id });
    const query = { "players._id": user.id };

    // Get user jackpot games
    const jackpotQuery = { "_winner._id": user.id };
    const jackpotGames = await JackpotGame.find(query).lean();
    const jackpotGamesWon = await JackpotGame.find(jackpotQuery).lean();

    // Convert every document to a game object
    const gamesPlayed = [
      ...jackpotGames.map(g => ({
        ...g,
        gamemode: "jackpot",
        ownBetAmount: g.players.find(player => player._id === user.id)
          .betAmount,
      })),
    ];

    // Convert every document to a game object
    const gamesWon = [
      ...jackpotGamesWon.map(g => ({
        ...g,
        gamemode: "jackpot",
        ownBetAmount: g.players.reduce((a, b) => a.betAmount + b.betAmount, 0),
      })),
    ];

    return res.json(
      [
        ...gamesPlayed.map(game => ({ ...game, won: false })),
        ...gamesWon.map(game => ({ ...game, won: true })),
      ].sort((a, b) => b.created - a.created)
    );
  } catch (error) {
    return next(error);
  }
});

/**
 * @route   POST /api/user/rakeback/claim
 * @desc    Claim rakeback based on the type [daily, weekly, monthly]
 * @access  Private
 */
router.post('/rakeback/claim', middleware, async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user.id })
    if (!user) {
      console.error("User not found, maybe database did an oopsie?");
      return next(new Error("User not found, maybe database did an oopsie?"));
    }

    const validTypes = ['daily', 'weekly', 'monthly']
    const { type } = req.body

    if (validTypes.indexOf(type) === -1) return next(new Error('Invalid rakeback type!'))

    const selectedRakeback = user.rakeBack[type]
    if (selectedRakeback.ends > Date.now()) return next(new Error(`You still have to wait to claim ${type} rakeback!`))

    const rakeBackConfig = {
      daily: config.games.profileRakeBack.dailyPercentage,
      weekly: config.games.profileRakeBack.weeklyPercentage,
      monthly: config.games.profileRakeBack.monthlyPercentage,
      houseEdge: config.games.profileRakeBack.houseEdge
    }
    const rakeBackValue = parseFloat(parseFloat(selectedRakeback.wagered * rakeBackConfig[type] * rakeBackConfig.houseEdge).toFixed(2))

    // insert transaction
    insertNewWalletTransaction(
      user.id,
      rakeBackValue,
      `Collected ${type} rakeback (wagered: ${parseFloat(selectedRakeback.wagered).toFixed(2)})`,
    );

    // reset the rakeback's type
    const rakeBackObject = defaultRakeBackObject()
    await User.updateOne(
      { _id: user.id },
      {
        $set: { [`rakeBack.${type}`]: rakeBackObject[type] },
        $inc: { wallet: rakeBackValue }
      }
    )

    return res.status(200).json({ type, rakeBackValue })
  } catch (e) {
    console.error(e)
    return next(e);
  }
})

/**
 * @route   GET /api/user/rakeback
 * @desc    Get the rakeback (if available) for all types
 * @access  Private
 */
router.get('/rakeback', middleware, async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user.id })
    if (!user) {
      console.error("User not found, maybe database did an oopsie?");
      return next(new Error("User not found, maybe database did an oopsie?"));
    }

    const rakeBackConfig = {
      daily: config.games.profileRakeBack.dailyPercentage,
      weekly: config.games.profileRakeBack.weeklyPercentage,
      monthly: config.games.profileRakeBack.monthlyPercentage,
      houseEdge: config.games.profileRakeBack.houseEdge
    }
    const sanitizeRakeBack = (rb) => {
      let newObject = {}
      for (let x in rb) {
        const i = rb[x]

        const feePercentage = rakeBackConfig[x]
        const rakeBackCalc = parseFloat(parseFloat(i.wagered * feePercentage * rakeBackConfig.houseEdge).toFixed(2))

        if (i.ends < Date.now())
          i.amount = rakeBackCalc

        delete i.wagered

        newObject[x] = i
      }
      return newObject
    }
    const setCorrectTime = (rb) => {
      let newObject = {}
      for (let x in rb) {
        const i = rb[x]

        i.time = parseInt((i.ends - Date.now()) / 1000)
        if (i.time > 0 && i.time < 60) {
          i.ftime = "in less than a minute";
        } else if (i.time < 3600) {
          const minutes = Math.floor(i.time / 60);
          i.ftime = `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else if (i.time < 86400) {
          const hours = Math.floor(i.time / 3600);
          i.ftime = `in ${hours} hour${hours > 1 ? 's' : ''}`;
        } else if (i.time > 86400) {
          const days = Math.floor(i.time / 86400);
          i.ftime = days === 1 ? "in a day" : `in ${days} days`;
        }

        newObject[x] = i
      }
      return newObject
    }

    // if there is no rakeBack for the user, let's create one
    if (!user.rakeBack) {
      try {
        const obj = defaultRakeBackObject()
        await User.updateOne(
          { _id: req.user.id },
          { $set: { rakeBack: obj } }
        );

        return res.json(setCorrectTime(sanitizeRakeBack(obj)))
      } catch (e) {
        return console.error(e)
      }
    }


    res.json(setCorrectTime(sanitizeRakeBack(user.rakeBack)))
  } catch (e) {
    return next(error);
  }
})

/**
 * @route   GET /api/user/profile
 * @desc    Get authenticated user's profile info
 * @access  Private
 */
router.get("/profile", middleware, async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user.id });

    // Check that user exists
    if (!user) {
      console.error("User not found, maybe database did an oopsie?");
      return next(new Error("User not found, maybe database did an oopsie?"));
    }

    // Get wallet transactions
    const transactions = await WalletTransaction.find({
      _user: user.id,
    }).sort({ created: -1 });

    // Get user games
    const coinflipGames = await CoinflipGame.find({ "players._id": user.id });
    const coinflipGamesWon = await CoinflipGame.find({ _winner: user.id });
    const jackpotGames = await JackpotGame.find({ "players._id": user.id });
    const jackpotGamesWon = await JackpotGame.find({ "_winner._id": user.id });
    const rouletteGames = await RouletteGame.find({
      "players._id": user.id,
    }).lean();
    const wheelGames = await WheelGame.find({
      "players._id": user.id,
    }).lean();

    const crashGames = await CrashGame.find({ _players: user.id });

    const rouletteGamesWon = rouletteGames.filter(
      game =>
        game.winner ===
        game.players.find(player => player._id === user.id).color
    );

    const wheelGamesWon = wheelGames
      .filter(game => {
        game.players
          .filter(p => p._id === user.id)
          .map(p => p.color)
          .includes(game.winner) ||
          game.winner === 'mystery' ||
          game.winner === '7x'
      })

    // Convert every document to a game object
    const gamesPlayed = [
      ...coinflipGames,
      ...jackpotGames,
      ...rouletteGames,
      ...wheelGames,
      ...crashGames,
    ];

    // Convert every document to a game object
    const gamesWon = [
      ...coinflipGamesWon,
      ...jackpotGamesWon,
      ...rouletteGamesWon,
      ...wheelGamesWon
    ];

    return res.json({
      gamesPlayed: gamesPlayed.length,
      gamesWon: gamesWon.length,
      totalDeposited: user.totalDeposited.toFixed(2),
      totalWithdrawn: user.totalWithdrawn.toFixed(2),
      wager: user.wager.toFixed(2),
      avatar: user.avatar,
      username: user.username,
      hasVerifiedAccount: user.hasVerifiedAccount,
      transactions,
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @route   GET /api/user/affiliates
 * @desc    Get authenticated user's affiliate info
 * @access  Private
 */
router.get("/affiliates", middleware, async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user.id });

    // Check that user exists
    if (!user) {
      console.error("User not found, maybe database did an oopsie?");
      return next(new Error("User not found, maybe database did an oopsie?"));
    }

    // Get user's affiliator
    const affiliator = await User.findOne({ _id: user._affiliatedBy });
    const affiliatedUsers = await AffiliateUser.aggregate(
      [
        {
          $match: {
            affiliatedBy: user._id,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
            pipeline: [
              {
                $project: {
                  username: 1,
                  avatar: 1,
                  _affiliatedBy: 1,
                }
              }
            ]
          },
        },
        {
          $unwind: '$user',
        },
        {
          $sort: {
            totalBet: -1,
          }
        }
      ]
    );

    for (let user of affiliatedUsers) {
      user.active = affiliatedUsers?.user?._affiliatedBy === req.user._id
    }

    return res.json({
      affiliateCode: user.affiliateCode || "",
      affiliateLink: user.affiliateCode
        ? `${config.site.frontend.productionUrl}/a/${user.affiliateCode}`
        : "Set affiliate code first!",
      affiliateMoney: user.affiliateMoney,
      affiliateMoneyAvailable:
        user.affiliateMoney - user.affiliateMoneyCollected,
      affiliateMoneyCollected: user.affiliateMoneyCollected,
      usersAffiliated: affiliatedUsers.length,
      currentlySupporting: affiliator
        ? { code: affiliator.affiliateCode, username: affiliator.username }
        : null,
      affiliatedUsers,
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @route   POST /api/user/affiliates/update-code
 * @desc    Update user's affiliate code
 * @access  Private
 */
router.post(
  "/affiliates/update-code",
  [
    checkMaintenance,
    validateJWT,
    check("code", "New affiliate code is required")
      .notEmpty()
      .isString()
      .withMessage("Invalid affiliate code type"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    // Check for validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code } = req.body;
    try {
      // Remove any illegal characters
      const parsedCode = encodeURI(
        code
          .replace(/[^\w\s]/gi, "")
          .replace(/\s/g, "")
          .toLowerCase()
      );

      // If still not valid
      if (parsedCode.length < 3) {
        res.status(400);
        return next(
          new Error(
            "Your code must be atleast 3 characters long and musn't contain special characters!"
          )
        );
      }

      // Get existing user with that affiliate code
      const existingUser = await User.findOne({
        affiliateCode: parsedCode,
      });

      // If affiliate code is already in-use
      if (existingUser && existingUser.id !== req.user.id) {
        res.status(400);
        return next(new Error("This affiliate code is already in-use!"));
      }

      // Update user document
      await User.updateOne(
        { _id: req.user.id },
        { $set: { affiliateCode: parsedCode } }
      );

      return res.json({ newAffiliateCode: parsedCode });
    } catch (error) {
      return next(error);
    }
  }
);

const affiliateClaimCooldown = 7 * 24 * 60 * 60 * 1000 // 7 days to claim new code

/**
 * @route   POST /api/user/affiliates/redeem
 * @desc    Redeem affiliate code and receive first time $0.10
 * @access  Private
 */
router.post(
  "/affiliates/redeem",
  [
    checkMaintenance,
    validateJWT,
    check("code", "Affiliate code is required")
      .notEmpty()
      .isString()
      .withMessage("Invalid affiliate code type"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    // Check for validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code } = req.body;
    try {
      // Get user from db
      const user = await User.findOne({ _id: req.user.id });

      // If user is not found
      if (!user) {
        return next(
          new Error("Couldn't find user! Maybe database did an error?")
        );
      }

      // If user isn't verified   !user.hasVerifiedAccount
      //if (user.totalDeposited < 5) {
      //  res.status(400);
      //  return next(
      //    new Error(
      //      "You must deposit min. $5.00 before redeeming an affiliate code!"
      //    )
      //  );
      //}

      // Get existing user with that affiliate code
      const existingUser = await User.findOne({
        affiliateCode: code.toLowerCase(),
      });

      // If affiliate code isn't valid
      if (!existingUser) {
        res.status(400);
        return next(
          new Error(
            "This affiliate code doesn't belong to anyone! Please double-check your input"
          )
        );
      }

      // If user is trying to affiliate himself
      if (existingUser.id === user.id) {
        res.status(400);
        return next(new Error("You can't affiliate yourself :)"));
      }

      // If this is user's first time redeeming a code
      if (!user._affiliatedBy) {
        // Update user
        await User.updateOne(
          { _id: user.id },
          {
            $inc: { wallet: 0.0001 },
            $set: {
              _affiliatedBy: existingUser.id,
              affiliateClaimed: new Date().toISOString(),
            },
          }
        );
        insertNewWalletTransaction(
          user.id,
          0.0001,
          "First time affiliate redeem",
          { affiliatorId: existingUser.id }
        );

        return res.json({
          code,
          username: existingUser.username,
          freeMoneyClaimed: true,
        });
      } else {
        const lastClaim = new Date(user.affiliateClaimed).getTime()

        if (lastClaim + affiliateClaimCooldown > Date.now()) {
          res.status(400);
          return next(new Error("You can only change your affiliate code every 7 days."));
        }

        // Update user
        await User.updateOne(
          {
            _id: user.id
          },
          {
            $set: {
              _affiliatedBy: existingUser.id,
              affiliateClaimed: new Date().toISOString(),
            }
          }
        );

        return res.json({
          code,
          username: existingUser.username,
          freeMoneyClaimed: false,
        });
      }
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @route   POST /api/user/affiliates/claim
 * @desc    Claim user's affiliate earnings
 * @access  Private
 */
router.post("/affiliates/claim", middleware, async (req, res, next) => {
  try {
    // Get user from DB
    const user = await User.findOne({ _id: req.user.id });

    // If user doesn't exist
    if (!user) {
      res.status(400);
      return next(new Error("User not found! (database error)"));
    }

    // User affiliate revenue
    const affiliateRevenue = user.affiliateMoney - user.affiliateMoneyCollected;

    // Check if user has enough revenue to collect it
    if (affiliateRevenue < 1) {
      res.status(400);
      return next(
        new Error("You must have collected atleast $1.00 before claiming it!")
      );
    }

    // Update user document
    await User.updateOne(
      { _id: user.id },
      {
        $inc: {
          wallet: Math.abs(affiliateRevenue),
          affiliateMoneyCollected: Math.abs(affiliateRevenue),
        },
      }
    );
    insertNewWalletTransaction(
      user.id,
      Math.abs(affiliateRevenue),
      "Affiliate revenue claim"
    );

    return res.json({ claimedAmount: parseFloat(affiliateRevenue.toFixed(2)) });
  } catch (error) {
    return next(error);
  }
});

/**
 * @route   GET /api/user/verify
 * @desc    Return data required to verify user's account
 * @access  Private
 */
router.get("/verify", middleware, async (req, res, next) => {
  try {
    // Get user from DB
    const user = await User.findOne({ _id: req.user.id });

    // If user doesn't exist
    if (!user) {
      res.status(400);
      return next(new Error("User not found! (database error)"));
    }

    return res.json({
      hasVerifiedAccount: user.hasVerifiedAccount,
      verifiedPhoneNumber: user.verifiedPhoneNumber,
      verificationType: "textmessage",
      // user.provider === "steam" ? "loyaltybadge" : "textmessage",
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @route   POST /api/user/verify/check
 * @desc    Check Steam user's inventory for Loyalty Badge
 * @access  Private
 */
router.post(
  "/verify/check",
  [checkMaintenance, validateJWT, limiter],
  async (req, res, next) => {
    res.status(400);
    return next(
      new Error(
        "We have removed this verification method, please use the SMS verification instead!"
      )
    );
    try {
      const user = await User.findOne({ _id: req.user.id });

      // If user doesn't exist
      if (!user) {
        res.status(400);
        return next(new Error("User not found! (database error)"));
      }

      // Check that user has registered with Steam
      if (user.hasVerifiedAccount || user.provider !== "steam") {
        res.status(400);
        return next(new Error("You can't verify using this method!"));
      }

      // Check if user has loyalty badge
      const hasBadge = await checkInventoryForLoyaltyBadge(user.providerId);

      // If user doesn't have the badge
      if (!hasBadge) {
        res.status(400);
        return next(
          new Error(
            "Couldn't find the Loyalty Badge in your CS:GO inventory. Unfortunately you cannot verify your account at the moment."
          )
        );
      }

      // Update user
      await User.updateOne(
        { _id: user.id },
        {
          $set: {
            hasVerifiedAccount: true,
            accountVerified: new Date().toISOString(),
          },
        }
      );

      return res.json({ success: true });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @route   POST /api/user/verify/send
 * @desc    Send an SMS verification code to user's phone number
 * @access  Private
 */
router.post(
  "/verify/send",
  [
    checkMaintenance,
    validateJWT,
    check("number", "Phone number is required")
      .notEmpty()
      .bail()
      .isString()
      .withMessage("Invalid phone number type")
      .bail(),
    // .isMobilePhone("any", { strictMode: true })
    // .withMessage("Please enter a valid phone number"),
    check("recaptchaResponse", "Please check the ReCAPTCHA field").notEmpty(),
    limiter,
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    // Check for validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { number, recaptchaResponse } = req.body;
    try {
      // Verify reCaptcha response
      const valid = await verifyRecaptchaResponse(recaptchaResponse);

      // If captcha wasn't valid
      if (!valid) {
        res.status(400);
        return next(
          new Error("Invalid ReCAPTCHA response, please try again later!")
        );
      }

      const user = await User.findOne({ _id: req.user.id });

      // If user doesn't exist
      if (!user) {
        res.status(400);
        return next(new Error("User not found! (database error)"));
      }

      // // If user has registered with steam
      // if (user.provider === "steam") {
      //   res.status(400);
      //   return next(
      //     new Error(
      //       "You can't use this verification method because you registered with Steam!"
      //     )
      //   );
      // }

      // Get account registered with this number
      const registeredUser = await User.findOne({
        verifiedPhoneNumber: number,
      });

      // If number is registered to another user
      if (registeredUser && registeredUser.id !== user.id) {
        res.status(400);
        return next(
          new Error(
            "This phone number has been used to register another user, please use a different phone number."
          )
        );
      }

      // Try to send the message
      await sendVerficationTextMessage(number);

      // Update user
      await User.updateOne(
        { _id: user.id },
        { $set: { verifiedPhoneNumber: number } }
      );

      return res.json({ mobileNumber: number });
    } catch (error) {
      console.log(
        "Error while sending verification code:",
        error.message,
        error.code,
        error.moreInfo
      );

      // Check if this was valid twilio error
      if (error.code && error.moreInfo) {
        // Filter common statuses
        if (error.code === 20003) {
          return next(
            new Error(
              "We are currently unavailable to send your verification code, please contact admins with this error code: 20003"
            )
          );
        } else {
          return next(
            new Error(
              "Couldn't send your verification code! Error: " + error.code
            )
          );
        }
      } else {
        return next(error);
      }
    }
  }
);

/**
 * @route   POST /api/user/verify/submit
 * @desc    Check verification code to verify user
 * @access  Private
 */
router.post(
  "/verify/submit",
  [
    checkMaintenance,
    validateJWT,
    check("code", "Verification code is required")
      .notEmpty()
      .bail()
      .isString()
      .withMessage("Invalid verification code type")
      .bail()
      .isLength({ min: 6, max: 6 })
      .withMessage("Invalid verification code!"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);

    // Check for validation errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code } = req.body;
    try {
      const user = await User.findOne({ _id: req.user.id });

      // If user doesn't exist
      if (!user) {
        res.status(400);
        return next(new Error("User not found! (database error)"));
      }

      // Check that user hasn't registered with Steam
      if (user.hasVerifiedAccount /* || user.provider === "steam" */) {
        res.status(400);
        return next(new Error("You can't verify using this method!"));
      }

      // Check if code is valid
      const verification = await verifyTextMessageCode(
        user.verifiedPhoneNumber,
        code
      );

      // Update user
      await User.updateOne(
        { _id: user.id },
        {
          $set: {
            hasVerifiedAccount: true,
            accountVerified: new Date().toISOString(),
          },
        }
      );

      return res.json({ success: true });
    } catch (error) {
      return next(error);
    }
  }
);
