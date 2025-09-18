const jwt = require('jsonwebtoken')
const fs = require('fs')

const privateKey = fs.readFileSync(`${__dirname}/private.pem`)
const publicKey = fs.readFileSync(`${__dirname}/public.pem`)

module.exports.createToken = async (payload, options, secret = privateKey) => {
  try {
    return jwt.sign(payload, secret, options)
  } catch (err) {
    throw err
  }
}

/**
 * 
 * 에러 정리
 export type VerifyErrors =
    | JsonWebTokenError
    | NotBeforeError
    | TokenExpiredError;
 */
module.exports.decodeToken = async (token, options, secret = publicKey) => {
  try {
    return jwt.verify(token, secret, options)
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw {status: 400, errorMessage: 'jwt expired'}
    } else {
      throw {status: 400, errorMessage: 'Invalid token'}
    }
  }
}

module.exports.createAccessToken = async (payload) => {
  try {
    const tokenTime = process.env.NODE_ENV === 'local' ? 60 * 60 * 24 : 60 * 60 * 2

    return await this.createToken(payload, {
      algorithm: 'RS256',
      expiresIn: tokenTime
    })
  } catch (err) {
    throw err
  }
}

module.exports.createRefreshToken = async (data, tokenSecret) => {
  try {
    const payload = {
      sub: data.user_idx
    }
    return await this.createToken(payload, {algorithm: 'HS256', expiresIn: 60 * 60 * 30}, tokenSecret)
  } catch (e) {
    throw e
  }
}
