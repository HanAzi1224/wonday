const {Sequelize, Model, DataTypes} = require('sequelize')
const {sequelize} = require('../loaders/sequelize')

class HumanResourceContract extends Model {}

HumanResourceContract.init(
  {
    human_resource_contract_idx: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      comment: '인덱스'
    },
    human_resource_idx: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: '인사관리인덱스'
    },
    contract_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '계약명'
    },
    one_line_explain: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '한줄설명'
    },
    contract_start_dt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '계약시작일'
    },
    contract_end_dt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: '계약종료일'
    },
    contract_status: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '계약상태[신규/갱신/변경/완료/퇴사]'
    },
    contract_amount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '계약금액'
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
    modelName: 'HumanResourceContract',
    tableName: 'human_resource_contract',
    timestamps: true,
    createdAt: 'first_create_dt',
    updatedAt: 'last_update_dt',
    deletedAt: 'delete_dt',
    paranoid: true
  }
)

module.exports = HumanResourceContract
