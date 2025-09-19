const ApiRouter = require('../../default').ApiRouter
const ctrl = require('./common-ctrl')

module.exports.getImageUrl = new ApiRouter({
  name: 'image/url',
  method: 'get',
  summary: 'Presigned URL 조회',
  schema: 'request/common/GetImagePreSignedUrl',
  tags: ['일반'],
  isPublic: true,
  apiType: ['user', 'admin'],
  responses: {
    200: {description: 'Success', schema: 'response/common/GetImagePreSignedUrl'},
    400: {description: 'Invalid data'}
  },
  handler: ctrl.getImageUrl
})
