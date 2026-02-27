// This entire code is dogshit and needs to be thrown away but I'm not paid enough to try

const datefns = require('date-fns')
const RaffleSchema = require('../models/Raffle')
const RaffleEntry = require('../models/RaffleEntry')

const oneHour = 60 * 60 * 1000
const oneDay = oneHour * 24
const oneWeek = oneDay * 7

function getStartOfHour(date) {
    return datefns.startOfHour(date).valueOf()
}

function getStartOfDay(date) {
    return datefns.startOfDay(date).valueOf()
}

function getStartOfWeek(date) {
    return datefns.startOfWeek(date).valueOf()
}

let hourlyRaffle
let dailyRaffle
let weeklyRaffle

let hourlyPrize = 0
let dailyPrize = 0
let weeklyPrize = 0

// I hate this without type script
async function startRaffles() {
    const activeRaffles = await RaffleSchema.find(
        {
            endingDate: {
                $gte: Date.now(),
            }
        }
    )

    for (let raffle of activeRaffles) {
        switch (raffle.type) {
            case 'hourly':
                hourlyRaffle = raffle;
            case 'daily':
                dailyRaffle = raffle;
            case 'weekly':
                weeklyRaffle = raffle;
        }
    }

    if (!hourlyRaffle) hourlyRaffle = await createNewRaffle({ prize: hourlyPrize, type: 'hourly', endingDate: getStartOfHour(Date.now() + oneHour) })
    if (!dailyRaffle) dailyRaffle = await createNewRaffle({ prize: dailyPrize, type: 'daily', endingDate: getStartOfDay(Date.now() + oneDay) })
    if (!weeklyRaffle) weeklyRaffle = await createNewRaffle({ prize: weeklyPrize, type: 'weekly', endingDate: getStartOfWeek(Date.now() + oneWeek) })
}

async function addUserToRaffles(
    {
        userID,
        amount,
    }
) {
    try {
        let currentHourlyEnd = getStartOfHour(Date.now() + oneHour)
        let currentDailyEnd = getStartOfDay(Date.now() + oneDay)
        let currentWeeklyEnd = getStartOfWeek(Date.now() + oneWeek)
    
        // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
        if (hourlyRaffle.endingDate !== currentHourlyEnd) {
            if (hourlyRaffle.rolling) return [ false, false ] // Really need to add a queue for when new raffle appears but I'm not being paid enough to care
            
            hourlyRaffle = await createNewRaffle({ prize: hourlyPrize, type: 'hourly', endingDate: getStartOfHour(Date.now() + oneHour) })
        }
        
        if (dailyRaffle.endingDate !== currentDailyEnd) {
            if (dailyRaffle.rolling) return [ false, false ] // Really need to add a queue for when new raffle appears but I'm not being paid enough to care
            
            dailyRaffle = await createNewRaffle({ prize: dailyPrize, type: 'daily', endingDate: getStartOfDay(Date.now() + oneDay) })
        }

        if (weeklyRaffle.endingDate !== currentWeeklyEnd) {
            if (weeklyRaffle.rolling) return [ false, false ] // Really need to add a queue for when new raffle appears but I'm not being paid enough to care
            
            weeklyRaffle = await createNewRaffle({ prize: weeklyPrize, type: 'weekly', endingDate: getStartOfWeek(Date.now() + oneWeek) })
        }

        await RaffleEntry.updateOne(
            {
                userID,
                raffle: hourlyRaffle._id
            },
            {
                $inc: {
                    amount,
                },
            },
            {
                upsert: true,
            }
        )

        await RaffleEntry.updateOne(
            {
                userID,
                raffle: dailyRaffle._id
            },
            {
                $inc: {
                    amount,
                },
            },
            {
                upsert: true,
            }
        )

        await RaffleEntry.updateOne(
            {
                userID,
                raffle: weeklyRaffle._id
            },
            {
                $inc: {
                    amount,
                },
            },
            {
                upsert: true,
            }
        )

        return [ true, false ]
    } catch (e) {
        return [ false, true ]
    }
}

async function createNewRaffle(
    {
        prize,
        type,
        endingDate,
    }
) {
    try {
        const newRaffle = await RaffleSchema.create(
            {
                prize,
                type,
                endingDate,
            },
        )
        return [ newRaffle, false ]
    } catch(e) {
        return [ null, true ]
    }
}