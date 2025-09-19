/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'contract_images'

    const columnDefinitions = {
      contract_image_idx: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        comment: '인덱스'
      },
      human_resource_contract_idx: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: '근로계약 인덱스'
      },
      image_url: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '계약서 이미지 url'
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
    await queryInterface.dropTable('contract_images')
  }
}
