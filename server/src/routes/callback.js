// Require Dependencies
const express = require("express");
const router = (module.exports = express.Router());
const colors = require("colors/safe");
const insertNewWalletTransaction = require("../utils/insertNewWalletTransaction");

const User = require("../models/User");
const CryptoTransaction = require("../models/CryptoTransaction");
const { checkAndApplyAffiliatorDeposit } = require("../controllers/affiliates");
const { convertCoinsToUSD } = require("../controllers/oxapay");


/**
 * @route   POST /api/callback/oxapay
 * @desc    OXAPay Listener API
 * @access  Public
 */
router.post('/oxapay', async (req, res, next) => {
  console.log(`~~~ OXAPAY ~~~`)
  console.log(req.body)
  console.log(`~~~ OXAPAY ~~~`)

  try {
    const { type } = req.body;

    if (type === 'payment') {
      const { txID, status, address, payCurrency, receivedAmount, trackId } = req.body;

      // Get user who made this deposit
      const user = await User.findOne({
        [`crypto.${payCurrency.toLowerCase()}.address`]: address,
      });

      // If user was not found in our database (not a site deposit)
      if (!user) {
        console.log(
          colors.blue("OXAPay >> IPN verified! (not a deposit to the site)")
        );
        return res.sendStatus(404)
      }

      // check if the payment is already in DB or not
      const isTransactionInDB = await CryptoTransaction.findOne({
        txid: txID
      })

      const exchangedAmount = convertCoinsToUSD(receivedAmount, payCurrency.toUpperCase())

      if (isTransactionInDB && status === "Paid") {

        await CryptoTransaction.updateOne(
          {
            tid: trackId
          },
          {
            state: 3
          }
        )

        insertNewWalletTransaction(user.id, exchangedAmount, "Crypto deposit", {
          transactionId: isTransactionInDB.id,
        });

        checkAndApplyAffiliatorDeposit(user._id.toString(), exchangedAmount)

        // Update user document
        await User.updateOne(
          { _id: user.id },
          {
            $inc: {
              wallet: exchangedAmount,
              totalDeposited: exchangedAmount,
              wagerNeededForWithdraw:
                user.wagerNeededForWithdraw < 0
                  ? Math.abs(user.wagerNeededForWithdraw) + exchangedAmount
                  : exchangedAmount, // Add 100% to required wager amount
            },
          }
        );

        res.sendStatus(200)
      } else {
        if (status === "Confirming" || status === "Paid") {
          // Create a new document
          const newTransaction = new CryptoTransaction({
            type: "deposit", // Transaction type

            currency: payCurrency, // Crypto currency name
            siteValue: exchangedAmount, // Value in site balance (USD)
            cryptoValue: receivedAmount, // Value in crypto currency
            address, // Crypto address

            tid: trackId, // OXAPay transaction id
            txid: txID, // Blockchain transaction id
            state: status === "Confirming" ? 1 : 3, // 1 = pending, 2 = declined, 3 = completed

            _user: user.id, // User who made this transaction
          });

          // Save the document
          await newTransaction.save();

          if (status === "Paid") {
            insertNewWalletTransaction(user.id, exchangedAmount, "Crypto deposit", {
              transactionId: newTransaction.id,
            });

            checkAndApplyAffiliatorDeposit(user._id.toString(), exchangedAmount)

            // Update user document
            await User.updateOne(
              { _id: user.id },
              {
                $inc: {
                  wallet: exchangedAmount,
                  totalDeposited: exchangedAmount,
                  wagerNeededForWithdraw:
                    user.wagerNeededForWithdraw < 0
                      ? Math.abs(user.wagerNeededForWithdraw) + exchangedAmount
                      : exchangedAmount, // Add 100% to required wager amount
                },
              }
            );
          }

          res.sendStatus(200)
        }
      }
    } else if (type === "payout") {
      const { trackId, txID, amount, status } = req.body;

      if (status === "Confirming") {
        await CryptoTransaction.updateOne(
          {
            tid: trackId
          },
          {
            txid: txID,
            cryptoValue: amount
          }
        )

        res.sendStatus(200)
      } else if (status === "Complete") {
        await CryptoTransaction.updateOne(
          {
            tid: trackId
          },
          {
            txid: txID,
            cryptoValue: amount,
            state: 3
          }
        )

        res.sendStatus(200)
      }
    }
  } catch (error) {
    console.error(`OXAPay error`, error);
    res.sendStatus(500)
  }
})
