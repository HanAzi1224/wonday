if (['production', 'development', 'local', 'test', 'migration'].indexOf(process.env.NODE_ENV) === -1) {
  process.env.NODE_ENV = 'local'
}
const envs = require(`./${process.env.NODE_ENV}`)

Object.assign(process.env, envs)

envs.email = {
  service: 'gmail',
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS
}

envs.limit = {
  notice: 2
}

module.exports = envs
