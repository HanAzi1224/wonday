const serializeError = require('serialize-error')
const path = require('path')
const fs = require('fs')
const logger = require('../loaders/logger')
const {sendNotification} = require('../components/webhook')

const packageJsonPath = path.join(__dirname, '..', '..', 'package.json')
const packageJsonData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
const packageName = packageJsonData.name

function notFound(req, res, next) {
  res.status(404).send()
}

function errorHandler(err, req, res, next) {
  const status = err.status && !isNaN(err.status) ? err.status : 500 // 기본 상태 코드를 500으로 설정
  logger.verbose('err : ', err)
  if (err instanceof Error) {
    try {
      err = {errorMessage: err.message, ...serializeError.serializeError(err)}
    } catch (error) {
      err = {errorMessage: error.message, ...error}
    }
  } else if (typeof err === 'string') {
    err = {errorMessage: err}
  } else if (typeof err === 'object') {
    try {
      err = {errorMessage: err.errorMessage, ...serializeError.serializeError(err)}
    } catch (error) {
      err = {errorMessage: error.message, ...error}
    }
  }

  if (req.app.get('env') === 'production') {
    if (err.stack) delete err.stack // production 환경에서는 스택 트레이스를 제거
  }

  if (status >= 500) {
    logger.fatal(err)
    if (process.env.NODE_ENV !== 'local') {
      const title = `에러가 발생했습니다 ${status} ${req.method} ${
        req.originalUrl
      } 해당 프로젝트 담당자는 확인바랍니다 ${process.env.NODE_ENV}환경 ${packageName} ${process.env.NAME}
      requestBody: ${JSON.stringify(req.body)}, params: ${JSON.stringify(req.params)}, query: ${JSON.stringify(
        req.query
      )}`
      // sendNotification('error', 'Internal Server Error', title, err) // Call the new function here
    }
    err = {errorMessage: '서버에 에러가 발생했습니다', status}
  }
  res.status(status).json({err, result: false} || {})
  res.end()
}

module.exports = (app) => {
  app.use(function (err, req, res, next) {
    if (err) next(err)
    else {
      const err = new Error('Not Found')
      err.status = 404
      next(err)
    }
  })
  app.use(notFound)
  app.use(errorHandler)
}
