module.exports.ApiRouter = class {
  constructor(object) {
    this.name = object.name
    this.method = object.method || 'get'
    this.summary = object.summary || ''
    this.description = object.description || ''
    this.tags = object.tags || []
    this.path = object.path
    this.schema = object.schema
    this.handler = object.handler
    this.parameters = object.parameters || []
    this.headers = object.headers || []
    this.responses = object.responses || {200: {description: 'Success'}}
    this.contentType = object.contentType || 'application/json'
    this.middlewares = object.middlewares || []
    this.isPublic = object.isPublic || false
    this.fileNames = object.fileNames || []
    this.apiType = object.apiType || []
    this.permissions = object.permissions || []
  }
}
