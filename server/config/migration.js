const path = require('path')
require('dotenv').config({
  path: path.resolve('.env')
})

module.exports = {
  host: process.env.MYSQL_HOST,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || '3306',
  dialect: 'mysql',
  timezone: 'Asia/Seoul'
}
