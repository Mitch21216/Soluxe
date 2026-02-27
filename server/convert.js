// Require Dependencies
const { connectDatabase } = require("./src/utils");
const BattleSchema = require("./src/models/BattlesGame.js");
const Transactions = require("./src/models/WalletTransaction.js");
const { isValidObjectId } = require("mongoose");
const { ObjectId } = require('mongodb')

function getWinningTeam(players, type, winningTeam) {
  switch (type) {
    case 1:
    case 2:
    case 3:
      return [players[winningTeam - 1]];
    case 4:
      return players.slice((winningTeam - 1) * 2)
    default:
      console.log(players, type, winningTeam)
      return []
  }
}

const sponsoredIDs = ['65d103d39a8ec43bbd7aad82', '65d8e06694d9511ffc3743ae', '65db689e32eaf123bcabe2a1', '65da5f3d32eaf123bcabb75b', '65dccbb828520d524f32fb1e', '65d67dbf2fa9c9989c11035f', '65d34b04f6a00b0f4d95136c', '65d4e7ebf6a00b0f4d954cd8', '65d991724f1aa10599cbb386', '65d31ea8f6a00b0f4d950e7a', '65d8f9e2e6a8f65dddef4ea1', '65dcbef428520d524f32f284', '65d4d4f1f6a00b0f4d954978', '65db6acb32eaf123bcabe48c', '65dc8ce328520d524f32e625', '65d927934f1aa10599cb9eb5', '65de619b28520d524f334347', '65db90ec28520d524f32b8cc', '65db532c32eaf123bcabd756', '65db54b432eaf123bcabd7da', '65db8fc628520d524f32b80c', '65dc475928520d524f32dbc3', '65db6acb32eaf123bcabe48c', '65db10b032eaf123bcabce51', '65d37a60f6a00b0f4d951909', '65d4eac8f6a00b0f4d954e1a', '65dd12db28520d524f330edb', '65e0e65fb64b89a5db62f87a', '65decb72c99ae285642399ca', '65d7ff5b1f10a819881f56d2', '65de977828520d524f334ab4', '65e919d230ef537452e9fefa', '65d345aaf6a00b0f4d9512cb', '65ef2a635595af63e29ea56d', '65d282e5f6a00b0f4d94f71a', '65d4f056f6a00b0f4d955022', '65de7d0a28520d524f334762', '65d27cbc566d850adb82718a', '65f62992000029a12ec0adf2', '65f1c3edd900026acb54c530', '65d91b8a4f1aa10599cb9c93', '65d2827ff6a00b0f4d94f6ee', '65dcf0d228520d524f33044f', '65d652472fa9c9989c10fc35']

// // Connect Database
// setTimeout(async () => {
//   // const seedrandom = require("seedrandom");

//   // let numRolls = 10_000_000
//   // let totalRolls = 0

//   // console.log(`Calculating ${numRolls} rolls.`)
//   // for (let i = 0; i < numRolls; i++) {
//   //   totalRolls += ~~(seedrandom(i)() * 100_000)
//   // }

//   // console.log(`Average roll over ${numRolls} is ${~~(totalRolls / numRolls)}`)

//   await connectDatabase('mongodb://crusade:E66DJym7pDW4@217.182.138.110');

//   console.log('Fetching')
//   try {
//     let battles = await BattleSchema.find({ status: 3, 'win.winningTeam': { $gt: 0 } }).sort({_id: -1}).limit(500)
//     let overall = 0, total = 0, totalBet = 0, totalWinnings = 0
  
//     console.log(`CALCULATING ${battles.length} battles edge`)
//     for (let b of battles) {
//       let totalCost = b.playerCount * b.betAmount
//       let totalWin = b.eachCaseResult.reduce((pv, round) => pv + round.reduce((pv2, item) => pv2 + item?.item?.price || 0, 0) || 0, 0)
//       let realPlayerCosts = b.players.reduce((pv, player) => {
//         if (!isValidObjectId(player.id) || sponsoredIDs.includes(player.id)) return pv
//         return pv + b.betAmount
//       }, 0)
//       let realPlayerWinnings = getWinningTeam(b.players, b.game_type, b.win.winningTeam).reduce((pv, player) => {
//         if (!isValidObjectId(player.id) || sponsoredIDs.includes(player.id)) return pv
//         return pv + b.win.winAmount
//       }, 0) 

//       if (isNaN(totalCost) || isNaN(totalWin)) continue

//       overall += totalWin / totalCost
//       totalBet += realPlayerCosts
//       totalWinnings += realPlayerWinnings
//       total++
//     }

//     console.log(total, overall)
  
//     console.log(`Total Games ${total} and house edge avg is ${overall / total}`)
//     console.log(`Total bet ${totalBet} and total won ${totalWinnings}`)
//   } catch (e) {
//     console.error(e)
//   }
// })

// Connect Database
setTimeout(async () => {
  // const seedrandom = require("seedrandom");

  // let numRolls = 10_000_000
  // let totalRolls = 0

  // console.log(`Calculating ${numRolls} rolls.`)
  // for (let i = 0; i < numRolls; i++) {
  //   totalRolls += ~~(seedrandom(i)() * 100_000)
  // }

  // console.log(`Average roll over ${numRolls} is ${~~(totalRolls / numRolls)}`)

  await connectDatabase('mongodb://crusade:E66DJym7pDW4@217.182.138.110');

  const convertedIDs = sponsoredIDs.map(id => new ObjectId(id))

  const allTxs = await Transactions.find({ reason: 'Jackpot play', _user: { $in: convertedIDs } })

  console.log(`total bet ${allTxs.reduce((pv, tx) => pv + tx.amount, 0)}`)

  // console.log('Fetching')
  try {

  } catch (e) {
    console.error(e)
  }
})

// 65d103d39a8ec43bbd7aad82