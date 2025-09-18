const express = require('./express')
const logger = require('./logger')
const {redisClient} = require('./redis')
// const {sequelize} = require('../models')

/**
 * 서버 초기화 함수
 */
const init = async () => {
  // Redis 기본 연결은 이미 redis.js에서 설정됨
  return true
}

module.exports = {
  express,
  logger,
  init
}
