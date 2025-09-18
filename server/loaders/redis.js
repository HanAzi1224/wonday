// eslint-disable-next-line import/no-extraneous-dependencies
const Redis = require('ioredis') // async/await를 사용하기 위해 ioredis를 사용합니다.

const session = require('express-session')
const connectRedis = require('connect-redis')
const config = require('../config') // 경로에 주의하세요!

const RedisStore = connectRedis(session)
const redisClient = new Redis(config.redis) // ioredis 인스턴스 생성

module.exports = {redisClient, RedisStore}
