const {addColors, createLogger, log, format, transports} = require('winston')
// const fluentLogger = require('fluent-logger')
const S3StreamLogger = require('s3-streamlogger').S3StreamLogger
const moment = require('moment')
const tz = require('moment-timezone')
const config = require('../config')

// const fluentTag = 'tew-landing-api'
// const fluentConfig = {
//   host: 'localhost',
//   port: 4000,
//   timeout: 3.0,
//   requireAckResponse: false
// }
const loggerLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    http: 4,
    verbose: 5,
    debug: 6,
    silly: 7
  },
  colors: {
    fatal: 'magenta'
  }
}
addColors(loggerLevels.colors)
const colorize = format.colorize()
let logger

const consoleLoggerFormat = format.printf(({level, message, timestamp, stack, reqId}) => {
  let logMessage = ''
  if (reqId) logMessage += `${reqId} - `
  logMessage += `${stack || message}`
  return `${colorize.colorize(level, `[${timestamp}][${level.toUpperCase()}]`)} - ${logMessage}`
})

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
  const loggerFormat = format.printf((info) => {
    const {level, message, stack} = info
    return JSON.stringify({
      log: {...info, message: `[${level.toUpperCase()}] - ${stack || message}`}
    })
  })
  // const FluentTransport = fluentLogger.support.winstonTransport({
  //   level: 'info',
  //   format: format.combine(format.timestamp(), format.errors({stack: true}), format.splat(), loggerFormat)
  // })
  const s3stream = new S3StreamLogger({
    bucket: 'tew-log',
    folder: `${config.aws.s3.bucket}-${process.env.NODE_ENV}/${moment().tz('Asia/Seoul').format('yyyy-MM-DD')}`,
    access_key_id: config.aws.accessKeyId,
    secret_access_key: config.aws.secretAccessKey,
    compress: true,
    max_file_size: 1000,
    upload_every: 3600000
  })
  // console.log('s3stream',s3stream)
  const transport = new transports.Stream({
    level: 'info',
    format: format.combine(format.timestamp(), format.errors({stack: true}), format.splat(), loggerFormat),
    stream: s3stream
  })
  // console.log('transport',transport)
  logger = createLogger({
    levels: loggerLevels.levels,
    transports: [
      // new FluentTransport(fluentTag, fluentConfig),
      transport,
      new transports.Console({
        level: 'info',
        format: format.combine(format.timestamp(), format.errors({stack: true}), consoleLoggerFormat),
        handleExceptions: true
      })
    ]
  })
  transport.on('error', function (err) {
    console.log('err', err)
  })
} else {
  logger = createLogger({
    levels: loggerLevels.levels,
    format: format.combine(
      format.prettyPrint(),
      format.simple(),
      format.timestamp(),
      format.errors({stack: true}),
      consoleLoggerFormat
    ),
    transports: [
      new transports.Console({
        level: 'debug',
        handleExceptions: true
      })
    ]
  })
}

function parseHttpLog(text) {
  try {
    const data = JSON.parse(text)
    const message = `"${data.method} ${data.url}" ${data.status} ${data.responseTime} ms${
      data.body ? ` - ${JSON.stringify(data.body)}` : ''
    }`
    delete data.body
    return {message, data}
  } catch (e) {
    return {message: text}
  }
}

const infoStream = {
  write: (text) => {
    const {message, data} = parseHttpLog(text)
    logger.info(message, data)
  }
}
const errorStream = {
  write: (text) => {
    const {message, data} = parseHttpLog(text)
    if (data.status === '500') logger.fatal(message, data)
    else logger.error(message, data)
  }
}
const printObjectProperties = (level, object) => {
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      logger.log(level, `${key}: ${object[key]}`)
    }
  }
}

const fatal = (...args) => {
  if (typeof args[0] === 'object') {
    printObjectProperties('fatal', args[0])
  } else {
    logger.fatal.apply(null, args)
  }
}
const error = (...args) => {
  if (typeof args[0] === 'object') {
    printObjectProperties('error', args[0])
  } else {
    logger.error.apply(null, args)
  }
}
const warn = (...args) => {
  if (typeof args[0] === 'object') {
    printObjectProperties('warn', args[0])
  } else {
    logger.warn.apply(null, args)
  }
}
const info = (...args) => {
  if (typeof args[0] === 'object') {
    printObjectProperties('info', args[0])
  } else {
    logger.info.apply(null, args)
  }
}
const http = (...args) => {
  if (typeof args[0] === 'object') {
    printObjectProperties('http', args[0])
  } else {
    logger.http.apply(null, args)
  }
}
const verbose = (...args) => {
  if (typeof args[0] === 'object') {
    printObjectProperties('verbose', args[0])
  } else {
    logger.verbose.apply(null, args)
  }
}
const debug = (...args) => {
  if (typeof args[0] === 'object') {
    printObjectProperties('debug', args[0])
  } else {
    logger.debug.apply(null, args)
  }
}
const silly = (...args) => {
  if (typeof args[0] === 'object') {
    printObjectProperties('silly', args[0])
  } else {
    logger.silly.apply(null, args)
  }
}
module.exports = {
  infoStream,
  errorStream,
  fatal,
  error,
  warn,
  info,
  http,
  verbose,
  debug,
  silly
}
