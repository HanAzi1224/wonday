const jwt = require('../libs/jwt/index')
const db = require('../models')

module.exports = async (req, res, next) => {
  try {
    if (!req.headers.authorization) throw {status: 400, errorMessage: 'Access Token required'}

    const bearer = req.headers.authorization.split(' ')[0]
    if (bearer !== 'Bearer') throw {status: 400, errorMessage: 'Invalid Bearer token'}

    const token = req.headers.authorization.split(' ')[1]
    if (!token) throw {status: 400, errorMessage: 'Invalid token type'}

    // 토큰 저장
    const jwtToken = await jwt.decodeToken(token, {algorithms: ['RS256'], ignoreExpiration: true})

    req.jwtToken = jwtToken

    if (jwtToken.user_idx) {
      const userChk = await db.Users.findOne({where: {user_idx: jwtToken.user_idx}})
      if (!userChk) throw {status: 400, errorMessage: '존재하지 않는 사용자입니다.'}
    }
    // else if (jwtToken.master_idx) {
    //   const masterChk = await db.Masters.findOne({where: {master_idx: jwtToken.master_idx}})
    //   if (!masterChk) throw {status: 400, errorMessage: '존재하지 않는 관리자입니다.'}
    // }
    next()
  } catch (err) {
    next(err)
  }
}
