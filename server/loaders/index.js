const express = require('./express')
const logger = require('./logger')
// const {sequelize} = require('../models')

/**
 * 서버 초기화 함수
 */
const init = async () => {
  return true
}

module.exports = {
  express,
  logger,
  init
}
