/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'users'

    const columnDefinitions = {
      user_idx: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        comment: '인덱스'
      },
      user_email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '유저이메일'
      },
      user_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '유저 이름'
      },
      user_phone: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '휴대폰번호'
      },
      fcm_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'fcm token'
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
    await queryInterface.dropTable('users')
  }
}
