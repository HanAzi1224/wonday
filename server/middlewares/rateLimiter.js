const redis = require('redis')
const RateLimit = require('express-rate-limit')
const RedisStoreRateLimit = require('rate-limit-redis')
const config = require('../config')

const redisClient = redis.createClient(config.redis)

const redisClientRateLimit = new RedisStoreRateLimit({
  client: redisClient
})
const limiter = new RateLimit({
  store: redisClientRateLimit,
  max: 10000, // limit each IP to 100 requests per windowMs
  delayMs: 0, // disable delaying - full speed until the max limit is reached
  windowMs: 60 * 1000, // 1 minute
  message: {result: false, errorMessage: 'Too many requests'},
  statusCode: 400
})

module.exports = limiter
