let express = require('express')
let api = require('../zain-api-integration')
let router = express.Router()

router.get('/', (req, res) => {
  res.send('There is nothing here!')
})

router.get('/event-info', async (req, res) => {
  let eventInfo = await api.getEventInfo(req.query.eventId, req.msisdn, req.query.language)
  res.json(eventInfo)
})

router.post('/start-event', async (req, res) => {
  let eventId = req.body.eventId
  let language = req.body.language

  // get event info
  let loyaltyResponse = await api.initGame(eventId, req.msisdn, language)

  res.json(loyaltyResponse)
})

router.post('/claim-reward', async (req, res) => {

  let rewardId = req.body.rewardId
  let eventId = req.body.eventId
  let offerId = req.body.offerId
  let language = req.body.language
  let msisdn = req.msisdn

  // call event info to check remaining claims.. charged if claims < 3
  let eventInfo = await api.getEventInfo(eventId, msisdn, language)

  if (typeof eventInfo.error !== 'undefined' || eventInfo.game_status === 'EXPIRED') {
    return res.json({error: 'Session Expired'})
  }

  let shouldCharge = eventInfo.remaining_claims < 3
  let chargeTransaction = null

  if (shouldCharge) {
    console.log('calling prepaid charge')
    let chargeResponse = await api.prepaidCharge(msisdn, 1)
    chargeTransaction = chargeResponse.transactionId
  }

  // get event info
  let response = await api.claimReward(eventId, rewardId, msisdn, language, offerId, chargeTransaction)

  res.json(response)
})

router.get('/balance-check', async (req, res) => {

  let balanceResponse = await api.getBalance(req.msisdn)

  // get prepaid balance
  let balance = balanceResponse.balance || 0
  let expiry = balanceResponse.expiry_date || '2000-01-01T00:00:00'

  let expiryParsed = new Date(Date.parse(expiry))

  let hasEnoughBalance = true

  if (Date.now() > expiryParsed) {
    hasEnoughBalance = false
  }

  let balanceParsed = Number.parseFloat(balance)

  if (balanceParsed < 1.001) {
    hasEnoughBalance = false
  }

  res.send({
    balance: balance,
    expiry: expiry,
    hasEnoughBalance: hasEnoughBalance
  })
})

module.exports = router
