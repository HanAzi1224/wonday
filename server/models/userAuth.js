const {Sequelize, Model, DataTypes} = require('sequelize')
const {sequelize} = require('../loaders/sequelize')

class UserAuth extends Model {}

UserAuth.init(
  {
    user_auth_idx: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      comment: '인덱스'
    },
    user_idx: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '유저인덱스'
    },
    user_pwd: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '유저 비밀번호'
    },
    access_token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '엑세스토큰'
    },
    user_salt: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '유저 비밀번호 솔트'
    },
    first_create_dt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: '등록일'
    },
    last_update_dt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
      comment: '수정일'
    },
    delete_dt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '삭제일'
    }
  },
  {
    sequelize,
    modelName: 'UserAuth',
    tableName: 'user_auth',
    timestamps: true,
    createdAt: 'first_create_dt',
    updatedAt: 'last_update_dt',
    deletedAt: 'delete_dt',
    paranoid: true
  }
)

module.exports = UserAuth
