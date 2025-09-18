const {USER_TYPE} = require('../models/enums')

module.exports = async (req, res, next) => {
  try {
    const {master_idx} = req.jwtToken
    if (!master_idx) {
      throw {status: 403, errorMessage: '관리자 권한이 없습니다.'}
    }
    next()
  } catch (err) {
    next(err)
  }
}
