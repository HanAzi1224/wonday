const {Sequelize, Model, DataTypes} = require('sequelize')
const {sequelize} = require('../loaders/sequelize')

class HumanResource extends Model {}

HumanResource.init(
  {
    human_resource_idx: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      comment: '인덱스'
    },
    master_user_idx: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '마스터유저인덱스(등록자)'
    },
    user_idx: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '유저인덱스'
    },
    position: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '직위'
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '부서'
    },
    user_image: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '유저이미지'
    },
    manage_type: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '업무영역[마케팅/MCN/기타]'
    },
    employment_dt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '입사일'
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
    modelName: 'HumanResource',
    tableName: 'human_resource',
    timestamps: true,
    createdAt: 'first_create_dt',
    updatedAt: 'last_update_dt',
    deletedAt: 'delete_dt',
    paranoid: true
  }
)

module.exports = HumanResource
