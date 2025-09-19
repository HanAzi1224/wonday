const Sequelize = require('sequelize')
const {sequelize} = require('../loaders/sequelize')

const db = {}

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db

const Users = require('./users')
const UserAuth = require('./userAuth')
const HumanResource = require('./humanResource')
const HumanResourceContract = require('./humanResourceContract')
const ContractImages = require('./contractImages')

db.Users = Users
db.UserAuth = UserAuth
db.HumanResource = HumanResource
db.HumanResourceContract = HumanResourceContract
db.ContractImages = ContractImages

// Users와 UserAuth 관계
db.Users.hasOne(db.UserAuth, {as: 'user_auth', foreignKey: 'user_idx'})
db.UserAuth.belongsTo(db.Users, {as: 'users', foreignKey: 'user_idx'})

// Users와 HumanResource 관계 (대상 유저)
db.Users.hasOne(db.HumanResource, {as: 'human_resource', foreignKey: 'user_idx'})
db.HumanResource.belongsTo(db.Users, {as: 'user', foreignKey: 'user_idx'})

// 마스터 유저 관계 (등록자) - 한 등록자가 여러 인사정보 등록 가능
db.Users.hasMany(db.HumanResource, {as: 'registered_human_resources', foreignKey: 'master_user_idx'})
db.HumanResource.belongsTo(db.Users, {as: 'master_user', foreignKey: 'master_user_idx'})

// HumanResource와 HumanResourceContract 관계 - 한 인사정보에 여러 계약 가능
db.HumanResource.hasMany(db.HumanResourceContract, {as: 'contracts', foreignKey: 'human_resource_idx'})
db.HumanResourceContract.belongsTo(db.HumanResource, {as: 'human_resource', foreignKey: 'human_resource_idx'})

// HumanResourceContract와 ContractImages 관계 - 한 계약에 여러 이미지 가능
db.HumanResourceContract.hasMany(db.ContractImages, {as: 'contract_images', foreignKey: 'human_resource_contract_idx'})
db.ContractImages.belongsTo(db.HumanResourceContract, {as: 'contract', foreignKey: 'human_resource_contract_idx'})
