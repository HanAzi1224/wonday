const {Sequelize, Model, DataTypes} = require('sequelize')
const {sequelize} = require('../loaders/sequelize')

class ContractImages extends Model {}

ContractImages.init(
  {
    contract_image_idx: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      comment: '인덱스'
    },
    human_resource_contract_idx: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '근로계약 인덱스'
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '계약서 이미지 url'
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
    modelName: 'ContractImages',
    tableName: 'contract_images',
    timestamps: true,
    createdAt: 'first_create_dt',
    updatedAt: 'last_update_dt',
    deletedAt: 'delete_dt',
    paranoid: true
  }
)

module.exports = ContractImages
