const getEndOfDay = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate(), 23, 59, 59)).getTime();
const getEndOfWeek = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() + (7 - new Date().getUTCDay()), 23, 59, 59)).getTime();
const getEndOfMonth = () => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 0, 23, 59, 59)).getTime();

const defaultRakeBackObject = () => {
  return {
    daily: {
      wagered: 0.00,
      ends: getEndOfDay()
    },
    weekly: {
      wagered: 0.00,
      ends: getEndOfWeek()
    },
    monthly: {
      wagered: 0.00,
      ends: getEndOfMonth()
    }
  }
}

module.exports = defaultRakeBackObject