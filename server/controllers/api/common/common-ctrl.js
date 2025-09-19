const uuid = require('uuid')
const axios = require('axios')
const db = require('../../../models')
const s3 = require('../../../components/s3')

module.exports.getImageUrl = async (req, res, next) => {
  try {
    const {type, mimetype, extension} = req.options
    const result = []

    const path = `${type}/${uuid.v4()}.${extension}`
    const url = s3.generatePreSignedUrl({
      key: path,
      mimetype
    })

    res.status(200).json({result: true, data: url, key: path})
  } catch (err) {
    next(err)
  }
}
