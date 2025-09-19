/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'user_auth'

    const columnDefinitions = {
      user_auth_idx: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        comment: '인덱스'
      },
      user_idx: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: '유저인덱스'
      },
      user_pwd: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '유저 비밀번호'
      },
      access_token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: '엑세스토큰'
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
    await queryInterface.dropTable('user_auth')
  }
}
