let axios = require('axios')
let crypto = require('crypto')
let request = require('request')

let clientId = 'l7xx486b3f3d15084522af1d6904bd0db36d'
let clientSecret = '9119e22b469143ad848d6241023c7447'

let token = null


axios.defaults.baseURL = 'http://iapi.kw.zain.com/rest'

axios.interceptors.request.use(async (config) => {
  await getGlobalToken()

  if (token != null) {
    config.headers.Authorization = `Bearer ${token.access_token}`
  }

  return config
}, (err) => {
  return Promise.reject(err)
})

exports.initGame = async (eventId, msisdn, language) => {
  let body = {
    Msisdn: msisdn,
    Language: language
  }
  let url = `games/1/instances/${eventId}/intialize`

  console.log(`API Req initGame(${url}): eventId ${eventId} body ${JSON.stringify(body)}`)

  try {

    let response = await axios.post(url, body)

    console.log(`API Res initGame: ${JSON.stringify(response.data)}`)

    return response.data
  } catch (e) {

    console.log('Error: initGame API - ' + JSON.stringify(e.response.data))

    if (typeof e.response.data.error !== 'undefined') {
      if (e.response.data.error === 'Server raised fault: \'ERROR: EVENT NOT FOUND\'') return {error: 'Event not found'}
      if (e.response.data.error === 'Server raised fault: \'ERROR: ALREADY PLAYED\'') return {error: 'Already Played'}
      if (e.response.data.error === 'Server raised fault: \'ERROR: GAME EXPIRED\'') return {error: 'Game expired'}
    }

    return {error: 'Unknown Error'}
  }

  // return {
  //   "game_status": "SUCCESS",
  //   "remaining_claims": 3,
  //   "rewards": [
  //     {
  //       "reward": {
  //         "id": "19",
  //         "reward_name": "300 Zain-to-Zain Minutes",
  //         "offer_id": "5849",
  //         "card_id": "brand-zain",
  //         "offer_value": "300",
  //         "offer_unit": "Minute",
  //         "validity": "5",
  //         "validity_unit": "Days",
  //         "claimed": "N"
  //       }
  //     },
  //     {
  //       "reward": {
  //         "id": "21",
  //         "reward_name": "15 International Minutes",
  //         "offer_id": "5851",
  //         "card_id": "world",
  //         "offer_value": "15",
  //         "offer_unit": "Minute",
  //         "validity": "5",
  //         "validity_unit": "Days",
  //         "claimed": "N"
  //       }
  //     },
  //     {
  //       "reward": {
  //         "id": "22",
  //         "reward_name": "30 Days Line Validity",
  //         "offer_id": "5852",
  //         "card_id": "favourite",
  //         "offer_value": "30",
  //         "offer_unit": "Days",
  //         "validity": "0",
  //         "validity_unit": "",
  //         "claimed": "N"
  //       }
  //     },
  //     {
  //       "reward": {
  //         "id": "23",
  //         "reward_name": "300 Local SMS",
  //         "offer_id": "5853",
  //         "card_id": "envelope",
  //         "offer_value": "300",
  //         "offer_unit": "SMS",
  //         "validity": "5",
  //         "validity_unit": "Days",
  //         "claimed": "N"
  //       }
  //     }
  //   ]
  // }
}

exports.getEventInfo = async (eventId, msisdn, language) => {
  let url = `games/1/instances/${eventId}/${eventId}/?msisdn=${msisdn}&language=${language}`
  console.log(`API Req getEventInfo(${url}): eventId ${eventId} msisdn ${msisdn} language ${language}`)

  try {
    let response = await axios.get(url)
    console.log(`API Res getEventInfo: ${JSON.stringify(response.data)}`)
    return response.data
  } catch (e) {
    console.log('Error: getEventInfo API - ' + JSON.stringify(e.response.data))
    if (typeof e.response.data.error !== 'undefined') {
      if (e.response.data.error === 'Server raised fault: \'ERROR: EVENT NOT FOUND\'') return {error: 'Event not found'}
      if (e.response.data.error === 'Server raised fault: \'ERROR: ALREADY PLAYED\'') return {error: 'Already Played'}
      if (e.response.data.error === 'Server raised fault: \'ERROR: GAME EXPIRED\'') return {error: 'Session expired'}
      if (e.response.data.error === 'Server raised fault: \'ERROR: SESSION EXPIRED\'') return {error: 'Session Expired'}

    }

    return {error: 'Unknown Error'}
  }

}

exports.claimReward = async (eventId, rewardId, msisdn, language, offerId, chargeTransactionId) => {
  try {
    let body = {
      Msisdn: msisdn,
      Language: language,
      OfferID: offerId
    }

    if (chargeTransactionId) body.ChargeTransactionID = chargeTransactionId

    let url = `games/1/instances/${eventId}/rewards/${rewardId}/claim`
    console.log(`API Req claimReward(${url}): eventId: ${eventId} rewardId: ${rewardId} ${JSON.stringify(body)}`)


    let response = await axios.post(url, body)

    console.log(`API Res claimReward: ${JSON.stringify(response.data)}`)

    return response.data
  } catch (e) {
    console.log('Error: claimReward API - ' + JSON.stringify(e.response.data))

    // {"error":"Server raised fault: 'ERROR: SESSION EXPIRED'"}
    if (typeof e.response.data.error !== 'undefined') {
      if (e.response.data.error === 'Server raised fault: \'ERROR: SESSION EXPIRED\'') return {error: 'Session Expired'}
    }

    return  {error: 'Unknown error'}
  }

  // return {
  //   "game_status": "SUCCESS",
  //   "remaining_claims": 2,
  //   "rewards": [
  //     {
  //       "reward": {
  //         "id": "19",
  //         "reward_name": "300 Zain-to-Zain Minutes",
  //         "offer_id": "5849",
  //         "card_id": "brand-zain",
  //         "offer_value": "300",
  //         "offer_unit": "Minute",
  //         "validity": "5",
  //         "validity_unit": "Days",
  //         "claimed": "N"
  //       }
  //     },
  //     {
  //       "reward": {
  //         "id": "21",
  //         "reward_name": "15 International Minutes",
  //         "offer_id": "5851",
  //         "card_id": "world",
  //         "offer_value": "15",
  //         "offer_unit": "Minute",
  //         "validity": "5",
  //         "validity_unit": "Days",
  //         "claimed": "N"
  //       }
  //     },
  //     {
  //       "reward": {
  //         "id": "22",
  //         "reward_name": "30 Days Line Validity",
  //         "offer_id": "5852",
  //         "card_id": "favourite",
  //         "offer_value": "30",
  //         "offer_unit": "Days",
  //         "validity": "0",
  //         "validity_unit": "",
  //         "claimed": "N"
  //       }
  //     },
  //     // {
  //     //   "reward": {
  //     //     "id": "23",
  //     //     "reward_name": "300 Local SMS",
  //     //     "offer_id": "5853",
  //     //     "card_id": "envelope",
  //     //     "offer_value": "300",
  //     //     "offer_unit": "SMS",
  //     //     "validity": "5",
  //     //     "validity_unit": "Days",
  //     //     "claimed": "N"
  //     //   }
  //     // }
  //   ]
  // }
}

exports.getIPInfo = async (ip) => {
  try {
    let url = `networks/ips/${ip}`
    console.log(`API Req getIPInfo(${url}): ${ip}`)

    let response = await axios.get(url)

    console.log(`API Res getIPInfo: ${JSON.stringify(response.data)}`)

    return response.data.Msisdn
  } catch (e) {
    console.log('Error: getIPInfo API - ' + JSON.stringify(e.response.data))
    return false
  }
}

exports.getBalance = async (msisdn) => {
  try {
    let url = `contracts/anonymous/subscribers/${msisdn}/balance`
    console.log(`API Req getBalance(${url}): ${msisdn}`)

    let response = await axios.get(url)

    console.log(`API Res getBalance: ${JSON.stringify(response.data)}`)

    return response.data
  } catch (e) {
    console.log('Error: getBalance API - ' + (typeof e.response === 'undefined' ? e : JSON.stringify(e.response.data)))
    return false
  }
}

exports.prepaidCharge = async function prepaidCharge(msisdn, amount, retryCount = 0) {
  try {

    let transactionId = uuid()

    let body = {
      "TransactionId": transactionId,
      "Role": "4",
      "FrontendId": "HTTP",
      "Msisdn": msisdn, //"99793041",
      "AccountId": "0",
      "AccountType": "1",
      "MerchantId": "Zain",
      "Amount": amount,
      "ProductId": "PlayGame",
      "Purpose": "Zain-Game"
    }

    let url = 'prepaid-charge'
    console.log(`API Req prepaidCharge(${url}): ${JSON.stringify(body)}`)

    let response = await axios.post(url, body)

    // "status_description": "Success"
    // "status_description": "Duplicate Key"
    console.log(`API Res prepaidCharge: ${JSON.stringify(response.data)}`)


    if (response.data.status_description === 'Duplicate Key' && retryCount < 3) {
      console.log(`Error: prepaidCharge API - Duplicate Key.. Retrying (${retryCount + 1})`)
      await prepaidCharge(msisdn, amount, ++retryCount)
      return
    }

    if (response.data.status_description === 'Success') {
      return {
        status: 'success',
        transactionId: transactionId
      }
    } else {
      return {
        status: 'error',
        message: response.data.status_description || 'unknown error'
      }
    }
    // return response.data
  } catch (e) {
    console.log('Error: prepaidCharge API - ' + JSON.stringify(e.response.data))
    return false
  }
}

let getGlobalToken = async () => {
  if (!token || new Date() >= token.expiry) {
    console.log('Token is null or expired.. getting new token')
    return await fetchToken()
  } else return token
}

let fetchToken = () => {
  return new Promise((resolve, reject) => {
    let date = new Date()
    // date.setHours(date.getHours() + 3)
    let dateString = `${date.getUTCFullYear()}${(date.getUTCMonth() + 1).toString().padStart(2, 0 )}${date.getUTCDate().toString().padStart(2, 0 )}`

    let shasum = crypto.createHash('sha1')
    shasum.update(`${clientId}${dateString}${clientSecret}`)

    let pass = shasum.digest('hex')

    let options = {
      method: 'POST',
      url: 'http://iapi.kw.zain.com/rest/oauth2/access_token',
      headers: {'content-type': 'application/x-www-form-urlencoded'},
      form:
        {
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'password',
          username: 'ZainGame',
          password: pass
        }
    }

    request(options, function (error, response, body) {
      if (error) {
        console.log('Error: fetchToken API - ' + JSON.stringify(error))

        reject(error)
        return
      }
      token = JSON.parse(body)
      token.date = new Date()
      token.expiry = new Date()
      token.expiry.setUTCSeconds(token.date.getUTCSeconds() + (token.expires_in - 60))
      resolve(token)
      console.log(token)
    })
  })
}

function uuid() {
  return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
