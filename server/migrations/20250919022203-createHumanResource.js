/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'human_resource'

    const columnDefinitions = {
      human_resource_idx: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
        comment: '인덱스'
      },
      master_user_idx: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: '마스터유저인덱스(등록자)'
      },
      user_idx: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: '유저인덱스'
      },
      position: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '직위'
      },
      department: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '부서'
      },
      user_image: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '유저이미지'
      },
      manage_type: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: '업무영역[마케팅/MCN/기타]'
      },
      employment_dt: {
        type: 'TIMESTAMP',
        allowNull: true,
        comment: '입사일'
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
    await queryInterface.dropTable('human_resource')
  }
}
