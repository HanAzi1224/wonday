const morgan = require('morgan')

const hiddenFields = ['password', 'newPassword']

morgan.token('reqId', (req) => req['id'])
morgan.token('userId', (req) => req['userId'])
morgan.token('body', (req) => {
  const ret = {...req.body}
  Object.keys(ret).forEach((key) => {
    if (hiddenFields.indexOf(key) > -1) ret[key] = '*'.repeat(8)
  })
  return ret
})

function jsonFormat(tokens, req, res) {
  return JSON.stringify({
    reqId: req.id,
    userId: tokens.userId(req, res),
    body: tokens.body(req, res),
    remoteAddress: tokens['remote-addr'](req, res),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    httpVersion: tokens['http-version'](req, res),
    status: tokens.status(req, res),
    contentLength: tokens.res(req, res, 'content-length'),
    referrer: tokens.referrer(req, res),
    userAgent: tokens['user-agent'](req, res),
    responseTime: tokens['response-time'](req, res)
  })
}

module.exports = ({skip, stream}) => morgan(jsonFormat, {skip, stream})
