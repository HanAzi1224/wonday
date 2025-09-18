const {Sequelize} = require('sequelize')
const config = require('../config')

const sequelize = new Sequelize(config.database.database, config.database.username, config.database.password, {
  // host: config.database.host,
  // dialect: 'mysql'
  ...config.database
})

// 스키마가 다른 곳에서 관계설정을 하기 때문에 스키마를 지원하도록 설정
sequelize.dialect.supports.schemas = true

module.exports = {sequelize}
