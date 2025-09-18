const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const ApiRouter = require('../../controllers/default').ApiRouter
// const schemas = require('../../schemas/index').entry
const {getSchema, getSchemas} = require('../../schemas')
const pkg = require('../../../package')

function escapeRefString(str, number) {
  return str.replace(/~/g, `~0`).replace(/\//g, '~1')
}

function generatePath(path, obj, swaggerPaths, source) {
  Object.keys(obj).forEach((key) => {
    const ctrl = obj[key]
    if (ctrl instanceof ApiRouter) {
      const urlPaths = []
      let url
      if (typeof ctrl.name === 'string') {
        if (ctrl.name.length > 0) {
          const sub = ctrl.name
            .split('/')
            .map((str) => {
              if (str.indexOf(':') === 0) {
                str = str.replace(':', '')
                return `{${str}}`
              }
              return str
            })
            .join('/')
          url = `${path}/${sub}`
        } else {
          url = path
        }
      } else {
        url = `${path}/${key}`
      }
      urlPaths.push(url)

      // if (source) {
      //   console.log('source', source)
      //   console.log('urlPaths', urlPaths)
      //   console.log('ctrl.apiType', ctrl.apiType)
      //   if (ctrl.apiType && Array.isArray(ctrl.apiType)) {
      //     if (!ctrl.apiType.includes('user')) {
      //       urlPaths.pop()
      //     }
      //     if (ctrl.apiType.includes('admin')) {
      //       urlPaths.push(`/admin${url}`)
      //     }
      //   }
      //   console.log('urlPaths in generator', urlPaths)
      // }

      for (let k = 0; k < urlPaths.length; k++) {
        if (ctrl.method) {
          if (!swaggerPaths.hasOwnProperty(urlPaths[k])) {
            swaggerPaths[urlPaths[k]] = {}
          }
          const path = {
            tags: ctrl.tags,
            summary: ctrl.summary,
            description: ctrl.description,
            parameters: [...ctrl.parameters],
            responses: {}
          }
          if (ctrl.path) {
            const schema = getSchema(ctrl.schema)
            if (!schema) throw new Error(`${ctrl.schema} schema not found`)
            _.forEach(schema.properties, (value, key) => {
              for (let i = 0; i < ctrl.path.length; i++) {
                if (ctrl.path[i] === key) {
                  path.parameters.push({
                    in: 'path',
                    name: key,
                    required: true,
                    schema: schema.properties[key],
                    description: schema.properties[key].description
                  })
                }
              }
            })
          }
          if (ctrl.headers) {
            const schema = getSchema(ctrl.schema)
            if (!schema) throw new Error(`${ctrl.schema} schema not found`)
            _.forEach(schema.properties, (value, key) => {
              for (let i = 0; i < ctrl.headers.length; i++) {
                if (ctrl.headers[i] === key) {
                  path.parameters.push({
                    in: 'header',
                    name: key,
                    required: !!(schema.required && schema.required.includes(key)),
                    schema: schema.properties[key],
                    description: schema.properties[key].description
                  })
                }
              }
            })
          }
          if (['post', 'put', 'delete'].includes(ctrl.method)) {
            if (!ctrl.responses || !ctrl.responses['200']) {
              if (!path.responses) path.responses = {}
              path.responses['200'] = {
                description: 'Success',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        result: {
                          type: 'boolean',
                          example: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          if (ctrl.responses) {
            Object.entries(ctrl.responses).forEach(([k, v]) => {
              const {schema, ...rest} = v
              if (Array.isArray(v)) {
                const content = {
                  'application/json': {schema: {oneOf: []}}
                }
                const oneOfArray = []
                for (const item of v) {
                  const {schema, ...rest} = item
                  oneOfArray.push({
                    ...rest,
                    $ref: `#/components/schemas/${escapeRefString(schema)}`
                  })
                }
                content['application/json'].schema['oneOf'] = oneOfArray
                path.responses[k] = {
                  content,
                  example: {
                    result: false,
                    err: {
                      status: 400,
                      errorMessage: 'Invalid data'
                    }
                  }
                }
              } else if (schema) {
                path.responses[k] = {
                  ...rest,
                  content: {
                    'application/json': {schema: {$ref: `#/components/schemas/${escapeRefString(schema)}`}}
                  }
                }
              } else if (parseInt(k, 10) >= 400) {
                path.responses[k] = {
                  ...rest,
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          result: {
                            type: 'boolean',
                            description: '응답 결과'
                          },
                          err: {
                            type: 'object',
                            properties: {
                              errorMessage: {
                                type: 'string',
                                description: '에러 메시지'
                              },
                              status: {
                                type: 'number',
                                description: 'HTTP 상태 코드'
                              },
                              request: {
                                type: 'array',
                                description: '에러 관련 데이터'
                              }
                            }
                          }
                        },
                        example: {
                          result: false,
                          err: {
                            status: 400,
                            errorMessage: 'data/1 값은 필수입니다',
                            request: []
                          }
                        }
                      }
                    }
                  }
                }
              } else {
                path.responses[k] = v
              }
            })
          }
          if (ctrl.schema) {
            if (['post', 'put', 'delete', 'patch'].includes(ctrl.method)) {
              const contentType = ctrl.contentType ? ctrl.contentType : 'application/json'
              const schema = getSchema(ctrl.schema)
              if (!schema) throw new Error(`${ctrl.schema} schema not found`)
              path.requestBody = {content: {}}
              path.requestBody.content[contentType] = {
                schema: {$ref: `#/components/schemas/${escapeRefString(ctrl.schema)}`}
              }
              if (schema && ['put', 'delete', 'patch'].includes(ctrl.method) && ctrl.path) {
                if (Object.keys(schema.properties).length === ctrl.path.length) {
                  delete path.requestBody
                }
              }
            } else {
              const schema = getSchema(ctrl.schema)
              if (!schema) throw new Error(`${ctrl.schema} schema not found`)
              if (schema && schema.properties) {
                // ctrl.headers에 정의된 헤더 키 목록을 가져옵니다.
                const headerKeys = ctrl.headers || []

                // 스키마의 properties를 순회하면서 ctrl.headers에 포함되지 않은 키들만 처리합니다.
                _.forEach(schema.properties, (value, key) => {
                  // ctrl.headers 배열에 현재 키가 없고, ctrl.path에도 포함되지 않은 경우에만 처리합니다.
                  if (!headerKeys.includes(key) && (!ctrl.path || !ctrl.path.includes(key))) {
                    path.parameters.push({
                      in: 'query', // 쿼리 파라미터로 추가
                      name: key,
                      schema: schema.properties[key],
                      description: schema.properties[key].description,
                      // 'required' 속성은 스키마의 'required' 배열에 키가 포함되어 있는지 여부로 결정
                      required: !!(schema.required && schema.required.includes(key))
                    })
                  }
                })
              }
            }
          }
          if (!ctrl.isPublic) {
            path.security = [{bearerAuth: []}]
          }
          swaggerPaths[urlPaths[k]][ctrl.method] = path

          if (source && ctrl.apiType && Array.isArray(ctrl.apiType) && ctrl.apiType.length > 0) {
            // source에 따라 API 유형을 필터링합니다.
            if (ctrl.apiType.includes(source)) {
              // ctrl.apiType 배열에 source가 포함되어 있으면 경로를 추가합니다.
              swaggerPaths[urlPaths[k]][ctrl.method] = path
            } else {
              // 필터링 조건에 맞지 않으면 해당 path를 삭제합니다.
              delete swaggerPaths[urlPaths[k]][ctrl.method]
            }
          } else if (
            ctrl.apiType &&
            Array.isArray(ctrl.apiType) &&
            ctrl.apiType.length > 0 &&
            !ctrl.apiType.includes('user')
          ) {
            // source 값이 설정되지 않았을 때, 'user'만 있는 API는 삭제합니다.
            delete swaggerPaths[urlPaths[k]][ctrl.method]
          }
        }
      }
    }
  })
}

function loadRoutes(dir, currentDir, swaggerPaths, source) {
  fs.readdirSync(dir)
    .sort((a, b) => {
      return (
        Number(fs.lstatSync(path.join(dir, b)).isDirectory()) - Number(fs.lstatSync(path.join(dir, a)).isDirectory())
      )
    })
    .forEach((target) => {
      const targetDir = path.join(dir, target)
      const routePath = `/${path
        .relative(currentDir, targetDir)
        .replace(/\/index.js/g, '')
        .replace(/\\/g, '/')}`
      if (fs.lstatSync(targetDir).isDirectory()) {
        loadRoutes(targetDir, currentDir, swaggerPaths, source)
      } else if (target.startsWith('index.')) {
        const requirePath = path.relative(__dirname, targetDir)
        const middleware = require(`./${requirePath}`)
        generatePath(routePath, middleware.default || middleware, swaggerPaths, source)
      }
    })
  return swaggerPaths
}

module.exports = (source) => {
  try {
    const securitySchemes = {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }

    const swagger = {
      openapi: '3.0.0',
      info: {
        title: `${pkg.name} ${process.env.NODE_ENV}`,
        description: `API Document for ${pkg.name} ${process.env.NODE_ENV}`,
        contact: {
          name: 'Marcus'
        },
        version: '0.1.0'
      },
      components: {
        // schemas,
        securitySchemes
      }
    }
    // console.log(path.join(__dirname, '../../controllers'))
    // servers.push({url:path.join('/',source)})
    // swagger.servers = servers
    swagger.servers = [{url: path.join('/', source)}]
    swagger.paths = loadRoutes(
      path.join(__dirname, '../../controllers'),
      path.join(__dirname, '../../controllers'),
      {},
      source
    )
    swagger.components.schemas = getSchemas(source).reduce((prev, curr) => {
      const {$id, ...rest} = curr
      prev[$id] = rest
      return prev
    }, {})
    if (source) {
      // console.log('swagger.paths',swagger.paths)
      // console.log('swagger',swagger)
    }
    return swagger
  } catch (err) {
    throw err
  }
}
