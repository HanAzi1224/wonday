/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'human_resource_contract'

    const columnDefinitions = {
      human_resource_contract_idx: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        comment: '인덱스'
      },
      human_resource_idx: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: '인사관리인덱스'
      },
      contract_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '계약명'
      },
      one_line_explain: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '한줄설명'
      },
      contract_start_dt: {
        type: 'TIMESTAMP',
        allowNull: false,
        comment: '계약시작일'
      },
      contract_end_dt: {
        type: 'TIMESTAMP',
        allowNull: false,
        comment: '계약종료일'
      },
      contract_status: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '계약상태[신규/갱신/변경/완료/퇴사]'
      },
      contract_amount: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '계약금액'
      },
      first_create_dt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '등록일'
      },
      last_update_dt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '수정일',
        onUpdate: 'CURRENT_TIMESTAMP'
      },
      delete_dt: {
        type: 'TIMESTAMP',
        allowNull: true,
        comment: '삭제일'
      }
    }

    const tableExists = await queryInterface.tableExists(table)
    if (!tableExists) {
      await queryInterface.createTable(table, columnDefinitions)
    } else {
      const columns = await queryInterface.describeTable(table)
      for (const [columnName, definition] of Object.entries(columnDefinitions)) {
        if (!columns[columnName]) {
          await queryInterface.addColumn(table, columnName, definition)
        } else {
          await queryInterface.changeColumn(table, columnName, definition)
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('human_resource_contract')
  }
}
