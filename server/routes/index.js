const fs = require('fs')
const path = require('path')
const ApiRouter = require('../controllers/default').ApiRouter
const jwtMiddleware = require('../middlewares/jwt')
const requestMiddleware = require('../middlewares/request')
const errorMiddleware = require('../middlewares/error')
const LimiterMiddleware = require('../middlewares/rateLimiter')
const permissionMiddleware = require('../middlewares/permission')
const headersMiddleware = require('../middlewares/headers')
// const logMiddleware = require('../middlewares/log')
const multipart = require('../middlewares/multipart')
const logger = require('../loaders/logger')
const {validate} = require('../schemas')

const excluded = ['/']

function validateResponse(ctrl) {
  return function (req, res, next) {
    const json = function (body) {
      if (res.headersSent) {
        next()
        return
      }
      let ret = body
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (ctrl.responses && ctrl.responses[res.statusCode]) {
          const response = ctrl.responses[res.statusCode]
          if (response.schema) {
            try {
              ret = JSON.parse(JSON.stringify(ret))
              validate(ret, response.schema)
            } catch (e) {
              if (process.env.NODE_ENV === 'production') logger.fatal(e)
              else next(e)
            }
          }
        }
      }
      json.call(res, ret)
    }
    // res.json =
    next()
  }
}

function getController(path, obj, app) {
  if (path !== '/index.js') {
    path = path.replace('/index.js', '')
  }

  if (typeof obj === 'function') {
    app.use(path, obj)
  } else {
    Object.keys(obj).forEach((key) => {
      const ctrl = obj[key]
      const urlPaths = []

      if (ctrl instanceof ApiRouter) {
        let url
        if (typeof ctrl.name === 'string') {
          url = ctrl.name.length > 0 ? `${path}/${ctrl.name}` : path
        } else {
          url = `${path}/${key}`
        }

        urlPaths.push(url)

        if (ctrl.apiType && ctrl.apiType.length !== 0) {
          // admin 경로 추가
          if (ctrl.apiType.includes('admin')) {
            urlPaths.push(`/admin${url}`)
          }
          // user 경로 추가
          if (ctrl.apiType.includes('user')) {
            urlPaths.push(url) // 기본 경로를 user로 가정
          }
        }

        if (typeof ctrl.handler !== 'function') {
          throw new Error(
            `path = ${path}, module.exports.${key}, method = ${ctrl.method}, summary = ${ctrl.summary} handler callback function not found`
          )
        }

        const args = []

        // log middleware
        args.push(validateResponse(ctrl))

        if (ctrl.contentType === 'multipart/form-data') {
          args.push(multipart(ctrl.fileNames))
        }

        // JWT middleware
        if (!ctrl.isPublic) {
          args.push(jwtMiddleware)
        }

        // permissionMiddleware
        if (ctrl.permissions.includes('master')) {
          args.push(permissionMiddleware)
        }

        // 헤더값도 받으면 request미들웨어 처리 후 헤더값 추가
        if (ctrl.headers.length > 0) {
          args.push((req, res, next) => headersMiddleware(req, res, next, ctrl.headers))
        }

        // Lastly, handler function
        args.push(requestMiddleware(ctrl.path, ctrl.schema), ctrl.handler)

        for (let i = 0; i < urlPaths.length; i++) {
          app[ctrl.method](urlPaths[i], ...args)
        }
        // console.log('app', app)
      }
    })
  }
}

function loadRoutes(dir, currentDir, router) {
  fs.readdirSync(dir)
    .sort((a, b) => {
      return (
        Number(fs.lstatSync(path.join(dir, b)).isDirectory()) - Number(fs.lstatSync(path.join(dir, a)).isDirectory())
      )
    })
    .forEach((target) => {
      const targetDir = path.join(dir, target)
      const routePath = path.dirname(`/${path.relative(currentDir, targetDir)}`)
      if (fs.lstatSync(targetDir).isDirectory()) {
        loadRoutes(targetDir, currentDir, router)
      } else if (target.startsWith('index.') && !excluded.includes(routePath)) {
        const importPath = path.relative(__dirname, targetDir)
        const file = require(`./${importPath}`)
        getController(routePath, file.default || file, router)
      }
    })
}

module.exports = (app) => {
  loadRoutes(__dirname, __dirname, app)
  loadRoutes(path.join(__dirname, '../controllers'), path.join(__dirname, '../controllers'), app)
  errorMiddleware(app)
}
