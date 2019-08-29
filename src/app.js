let express = require('express')
let logger = require('morgan')
let indexRouter = require('./routes')

let app = express()
//aasaleh-aaded this dummy line
// if (process.env.NODE_ENV === 'development')
// {
//   app.use(function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*')
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
//     res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
//     next()
//   })
// }

let getIPInfo = require('./zain-api-integration/index').getIPInfo

app.use(logger('combined'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.post('/submit-statistic', (req, res) => {
  console.log(req.body.text + ' IP ' + (req.headers['x-real-ip'] ||
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress))
  return res.status(200).send('OK')
})

app.use(async (req, res, next) => {
  let ip = req.headers['x-real-ip'] ||
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress

  let msisdn = await getIPInfo(ip) //'99793041'

  if (!msisdn) {
    res.status(200).send({error: 'Non Zain subscriber'})
    return
  }

  req.msisdn = msisdn
  next()
})

app.use('/', indexRouter)

app.use(function (err, req, res, next) {
  console.error(err.message)
  next(err)
})

app.use(function (err, req, res, next) {
  if (req.xhr) {
    res.status(500).send({error: 'Something failed!'})
  } else {
    next(err)
  }
})

app.use(function (err, req, res, next) {
  res.status(500)
  res.render('error', {error: err})
})

module.exports = app
