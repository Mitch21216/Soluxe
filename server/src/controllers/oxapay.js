const { General, Merchant, Payout } = require("oxapay");

const config = require('../config');

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const CALLBACK_URL = IS_PRODUCTION
  ? config.authentication.oxapay.callback_url.productionUrl
  : config.authentication.oxapay.callback_url.developmentUrl;

const client = {
  general: new General(config.authentication.oxapay.general),
  merchant: new Merchant(config.authentication.oxapay.merchant),
  payout: new Payout(config.authentication.oxapay.payout)
}

let RATES = {}
let COINS = []

const timeouts = {
  rates: null,
  allowed_coins: null
}

function init() {
  getRates()
  getAllowedCoins()
  setInterval(() => {
    if (timeouts.rates) clearTimeout(timeouts.rates)
    if (timeouts.allowed_coins) clearTimeout(timeouts.allowed_coins)
    getRates()
    getAllowedCoins()
  }, 30 * 60000)
}

async function getRates() {
  client.general.cryptoPrices().then(rates => {
    if (timeouts.rates) clearTimeout(timeouts.rates)
    if (rates.result !== 100)
      return timeouts.rates = setTimeout(() => {
        getRates()
      }, 60 * 1000);
    RATES = rates.data // object like {BTC: 'btc_usd_price', ETH: 'eth_usd_price'}
  }).catch(e => {
    console.error(e.toString(), "--> error getting crypto rates");
    if (timeouts.rates) clearTimeout(timeouts.rates)
    timeouts.rates = setTimeout(() => {
      getRates()
    }, 30 * 1000);
  })
}

async function getAllowedCoins() {
  client.merchant.allowedCoins().then(coins => {
    if (timeouts.allowed_coins) clearTimeout(timeouts.allowed_coins)
    if (coins.result !== 100)
      return timeouts.allowed_coins = setTimeout(() => {
        getAllowedCoins()
      }, 60 * 1000)
    COINS = coins.allowed // array, e.g: ['BTC', 'ETH', 'LTC']
  }).catch(e => {
    console.error(e.toString(), "--> error getting allowed crypto coins");
    if (timeouts.allowed_coins) clearTimeout(timeouts.allowed_coins)
    timeouts.allowed_coins = setTimeout(() => {
      getAllowedCoins()
    }, 30 * 1000);
  })
}

async function createDepositAddress(currency) {
  let address = false;
  try {
    const data = await client.merchant.createStaticAddress({
      currency,
      callbackUrl: CALLBACK_URL
    })
    address = data
  } catch (e) {
    console.log(e.toString(), "--> error creating address", currency);
  }
  return address;
}

async function createWithdraw(address, amount, currency) {
  // the amount is already in USD
  let success = false;
  try {
    const data = await client.payout.createPayout({
      address,
      amount: convertUSDToCoins(amount, currency),
      currency,
      callbackUrl: CALLBACK_URL
    })

    return data
  } catch (e) {
    console.error(
      e.toString(),
      "--> error creating withdraw for address",
      address,
      amount,
      currency
    );
  }
  return success;
}


function convertUSDToCoins(amount, currency) {
  return amount / RATES[currency];
}

function convertCoinsToUSD(amount, currency) {
  return amount * RATES[currency];
}


module.exports = {
  init,
  createDepositAddress,
  createWithdraw,
  convertUSDToCoins,
  convertCoinsToUSD,
}