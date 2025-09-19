/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // users 테이블의 user_email 컬럼을 user_id로 변경
    await queryInterface.renameColumn('users', 'user_email', 'user_id')
  },

  async down(queryInterface, Sequelize) {
    // user_id 컬럼을 다시 user_email로 복구
    await queryInterface.renameColumn('users', 'user_id', 'user_email')
  }
}
