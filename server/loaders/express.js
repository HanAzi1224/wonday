const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({
  path: path.join(__dirname, '..', '..', '.env')
})

const app = express()
const logger = require('./logger')
const assignId = require('../middlewares/assignId')
const morgan = require('../middlewares/morgan')
const routes = require('../routes')

app.enable('trust proxy')
app.set('etag', false)
app.set('views', path.join(__dirname, '../views'))
app.set('view engine', 'ejs')

app.use(cors())
app.use(assignId)
app.use(
  morgan({
    skip: (req, res) => req.originalUrl.includes('/swagger') || res.statusCode > 300,
    stream: logger.infoStream
  })
)
app.use(
  morgan({
    skip: (req, res) => res.statusCode < 400,
    stream: logger.errorStream
  })
)

const contentSecurityPolicy = {
  directives: {
    'default-src': ["'self'"],
    'script-src': ["'self'", 'https://cdn.iamport.kr', "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'connect-src': ["'self'", 'https:', 'https://service.iamport.kr', 'https://cdn.iamport.kr'],
    'frame-src': ['https://service.iamport.kr']
  }
}

app.use(
  helmet({
    contentSecurityPolicy
  })
)

app.use(express.json({limit: '10mb'}))
app.use(express.urlencoded({extended: false}))
app.use(
  helmet({
    contentSecurityPolicy
  })
)
app.use('/results', express.static(path.join(__dirname, '../../results')))

routes(app, morgan)

// console.log('typeof app',typeof app)

module.exports = app
