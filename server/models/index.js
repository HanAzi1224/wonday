const Sequelize = require('sequelize')
const {sequelize} = require('../loaders/sequelize')

const db = {}

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db

const Users = require('./users')
const UserAuth = require('./userAuth')

db.Users = Users
db.UserAuth = UserAuth

db.Users.hasOne(db.UserAuth, {as: 'user_auth', foreignKey: 'user_idx'})
db.UserAuth.belongsTo(db.Users, {as: 'users', foreignKey: 'user_idx'})
