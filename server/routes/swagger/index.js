const express = require('express')

const router = express.Router()
const basicAuth = require('express-basic-auth')
const generator = require('./generator')
const config = require('../../config')
const pkg = require('../../../package.json')

const swaggerFile = 'doc.json'
const doc = generator('')
doc.info.title = `${doc.info.title} user api`
const docAdmin = generator('admin')
docAdmin.info.title = `${docAdmin.info.title} admin api`

let description = ''
description = '\n' + `- [${doc.info.title}](/swagger)\n` + `- [${docAdmin.info.title}](/swagger/admin)\n`

doc.info.description += description
docAdmin.info.description += description

// if (process.env.NODE_ENV !== 'production') {
router.use(
  basicAuth({
    users: {[config.swagger.id]: config.swagger.password},
    challenge: true,
    realm: `${pkg.name} ${process.env.NODE_ENV}`
  })
)
router.use(
  '/',
  (req, res, next) => {
    // console.log('req',req)
    if (req.url === '/') {
      return res.redirect(`?url=${swaggerFile}`)
    }
    // if (req.url === '/index') {
    //   return res.render('index', {title: 1})
    // }
    next()
  },
  express.static(`${__dirname}/../../../node_modules/swagger-ui-dist`)
)

router.route(`/${swaggerFile}`).get((req, res, next) => {
  try {
    console.log('swagger called')
    res.status(200).json(doc)
  } catch (err) {
    next(err)
  }
})

router.use(
  '/admin',
  (req, res, next) => {
    if (req.url === '/') {
      // console.log('req url',req.url)
      return res.redirect(`?url=${swaggerFile}#`)
    }
    next()
  },
  express.static(`${__dirname}/../../../node_modules/swagger-ui-dist`)
)

router.route(`/admin/${swaggerFile}`).get((req, res, next) => {
  try {
    // console.log('swagger admin called')
    res.status(200).json(docAdmin)
  } catch (err) {
    next(err)
  }
})
// }

module.exports = router
