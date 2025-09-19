/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // user_auth 테이블에 user_salt 컬럼 추가
    await queryInterface.addColumn('user_auth', 'user_salt', {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: '유저 비밀번호 솔트'
    })
  },

  async down(queryInterface, Sequelize) {
    // user_salt 컬럼 삭제
    await queryInterface.removeColumn('user_auth', 'user_salt')
  }
}
