// Require Dependencies
const express = require("express");
const router = (module.exports = express.Router());

const CaseSchema = require("../../../models/Case");
const { caseList } = require("../../../controllers/games/battles");

/**
 * @route   GET /api/external/v1/users/list
 * @desc    List all users at that time
 * @access  Private
 */
router.get("/list", async (req, res, next) => {
  try {
    const cases = await CaseSchema.find().sort({ created: -1 });

    return res.json(cases);
  } catch (error) {
    return next(error);
  }
});

router.get("/get/:caseSlug", async (req, res, next) => {
  try {
    const caseSlug = req.params.caseSlug

    const c = await CaseSchema.findOne({ slug: caseSlug })

    return res.json(c);
  } catch (error) {
    return next(error);
  }
});

router.post("/delete", async (req, res, next) => {
  try {
    let { slug } = req.body;

    if (typeof slug !== 'string' || slug.trim().length < 1) return res.json({ success: false, message: 'Invalid case slug' })

    slug = slug.trim()

    const existingCase = await CaseSchema.findOne({ slug })
    if (!existingCase) return res.json({ success: false, message: 'No case with this slug exists.' })

    await CaseSchema.deleteOne(
      {
        slug,
      },
    )

    caseList.delete(slug)

    return res.json({ success: true, message: `Successfully deleted the case ${slug}`});
  } catch (error) {
    return next(error);
  }
});


router.post("/edit", async (req, res, next) => {
  try {
    let { name, slug, price, image, items } = req.body;

    if (typeof price === 'string') price = parseFloat(price)

    if (typeof name !== 'string' || name.trim().length < 1) return res.json({ success: false, message: 'Invalid case name' })
    if (typeof slug !== 'string' || slug.trim().length < 1) return res.json({ success: false, message: 'Invalid case slug' })
    if (typeof image !== 'string' || image.trim().length < 1) return res.json({ success: false, message: 'Invalid case image' })
    if (typeof price !== 'number' || isNaN(price) || price <= 0) return res.json({ success: false, message: 'Invalid case price' })
    if (!Array.isArray(items) || items.length < 1) return res.json({ success: false, message: 'Invalid case items' })

    name = name.trim()
    slug = slug.trim()
    image = image.trim()

    const existingCase = await CaseSchema.findOne({ slug })
    if (!existingCase) return res.json({ success: false, message: 'No case with this slug exists.' })

    let sanitizedItems = []
    let rawCasePrice = 0
    let totalTickets = 0
    
    for (let item of items) {
      if (typeof item.price === 'string') item.price = parseFloat(item.price)
      if (typeof item.tickets === 'string') item.tickets = Math.floor(parseFloat(item.tickets))

      if (typeof item.name !== 'string' || item.name.length < 1) return res.json({ success: false, message: 'One or more of your items have invalid names.' })
      if (typeof item.image !== 'string' || item.image.length < 1) return res.json({ success: false, message: `${item.name} has an incorrect image.` })
      if (typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) return res.json({ success: false, message: `${item.name} has an invalid price.` })
      if (typeof item.color !== 'string' || item.color.length < 1) return res.json({ success: false, message: `${item.name} has an invalid color.` })
      if (typeof item.tickets !== 'number' || isNaN(item.tickets) || item.tickets < 1) return res.json({ success: false, message: `${item.name} has an incorrect ticket value.` })
      if (item.stattrack !== 'yes' && item.stattrack !== 'no') return res.json({ success: false, message: `${item.name} has an incorrect stattrack value, should either be yes or no.` })

      totalTickets += item.tickets

      const itemChance = item.tickets / 100_000
      rawCasePrice += item.price * itemChance

      sanitizedItems.push({
        name: item.name.trim(),
        image: item.image.trim(),
        price: item.price,
        color: item.color.trim(),
        tickets: item.tickets,
        stattrack: item.stattrack,
        type: item.type,
        chance: `${(itemChance * 100)}%` // fucking ew
      })
    }

    if (totalTickets !== 100_000) return res.json({ success: false, message: 'Total tickets must add up to 100_000' })
    if (rawCasePrice * 1.05 > price) return res.json({ success: false, message: `Minimum house edge is 5%, 10% edge would be $${Math.floor(rawCasePrice * 1.1 * 100) / 100}`})

    sanitizedItems = sanitizedItems.sort((a,b) => a.price - b.price)

    // also so ew, sorry
    let currentTickets = 0
    for (let item of sanitizedItems) {
      const startTickets = currentTickets
      currentTickets += item.tickets

      item.ticketsStart = startTickets
      item.ticketsEnd = currentTickets
    }

    const newCase = await CaseSchema.findOneAndUpdate(
      {
        slug,
      },
      {
        $set: {
          name,
          price,
          image,
          items: sanitizedItems,
        }
      },
      {
        new: true,
      }
    )

    caseList.set(slug, newCase)

    return res.json({ success: true, message: `Successfully edited the case ${name}`});
  } catch (error) {
    return next(error);
  }
});

router.post("/create", async (req, res, next) => {
  try {
    let { name, slug, price, image, items } = req.body;

    if (typeof price === 'string') price = parseFloat(price)

    if (typeof name !== 'string' || name.trim().length < 1) return res.json({ success: false, message: 'Invalid case name' })
    if (typeof slug !== 'string' || slug.trim().length < 1) return res.json({ success: false, message: 'Invalid case slug' })
    if (typeof image !== 'string' || image.trim().length < 1) return res.json({ success: false, message: 'Invalid case image' })
    if (typeof price !== 'number' || isNaN(price) || price <= 0) return res.json({ success: false, message: 'Invalid case price' })
    if (!Array.isArray(items) || items.length < 1) return res.json({ success: false, message: 'Invalid case items' })

    name = name.trim()
    slug = slug.trim()
    image = image.trim()

    const existingCase = await CaseSchema.findOne({ slug })
    if (existingCase) return res.json({ success: false, message: 'A case with this slug already exists.' })

    let sanitizedItems = []
    let rawCasePrice = 0
    let totalTickets = 0
    
    for (let item of items) {
      if (typeof item.price === 'string') item.price = parseFloat(item.price)
      if (typeof item.tickets === 'string') item.tickets = Math.floor(parseFloat(item.tickets))

      if (typeof item.name !== 'string' || item.name.length < 1) return res.json({ success: false, message: 'One or more of your items have invalid names.' })
      if (typeof item.image !== 'string' || item.image.length < 1) return res.json({ success: false, message: `${item.name} has an incorrect image.` })
      if (typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) return res.json({ success: false, message: `${item.name} has an invalid price.` })
      if (typeof item.color !== 'string' || item.color.length < 1) return res.json({ success: false, message: `${item.name} has an invalid color.` })
      if (typeof item.tickets !== 'number' || isNaN(item.tickets) || item.tickets < 1) return res.json({ success: false, message: `${item.name} has an incorrect ticket value.` })
      if (item.stattrack !== 'yes' && item.stattrack !== 'no') return res.json({ success: false, message: `${item.name} has an incorrect stattrack value, should either be yes or no.` })

      totalTickets += item.tickets

      const itemChance = item.tickets / 100_000
      rawCasePrice += item.price * itemChance

      sanitizedItems.push({
        name: item.name.trim(),
        image: item.image.trim(),
        price: item.price,
        color: item.color.trim(),
        tickets: item.tickets,
        stattrack: item.stattrack,
        type: item.type,
        chance: `${(itemChance * 100).toFixed(2)}%` // fucking ew
      })
    }

    if (totalTickets !== 100_000) return res.json({ success: false, message: 'Total tickets must add up to 100_000' })
    if (rawCasePrice * 1.05 > price) return res.json({ success: false, message: `Minimum house edge is 5%, 10% edge would be $${Math.floor(rawCasePrice * 1.1 * 100) / 100}`})

    sanitizedItems = sanitizedItems.sort((a,b) => a.price - b.price)

    // also so ew, sorry
    let currentTickets = 0
    for (let item of sanitizedItems) {
      const startTickets = currentTickets
      currentTickets += item.tickets

      item.ticketsStart = startTickets
      item.ticketsEnd = currentTickets
    }

    const dbRes = await CaseSchema.create({
      name,
      price,
      image,
      slug,
      items: sanitizedItems,
    })

    if (!dbRes._id) return res.json({ success: false, message: 'We were unable to create the case since the DB failed to insert' })

    caseList.set(slug, dbRes.toJSON())

    return res.json({ success: true, message: `Successfully created the case ${name}`});
  } catch (error) {
    return next(error);
  }
});