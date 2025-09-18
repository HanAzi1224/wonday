'use strict'

const AWS = require('aws-sdk')
const config = require('../config/index')

AWS.config = {
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: "ap-northeast-2",
  apiVersions: {
    s3: '2006-03-01',
    dynamodb: '2012-08-10'
  },
}

module.exports = AWS