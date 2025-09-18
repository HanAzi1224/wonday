const {express, init, logger} = require('./loaders')

const port = process.env.PORT || 4000
;(async () => {
  // await init()
  const server = express.listen(port, () => {
    const addr = server.address()
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`
    logger.debug(`Listening on ${bind}`)
  })
})()
