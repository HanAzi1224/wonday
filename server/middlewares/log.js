const fs = require('fs')

module.exports = async (req, res, next) => {
  try {
    const host = req.headers.host
    const params = req.params
    const body = req.body
    const user_ip = req.connection.remoteAddress
    const originalUrl = req.originalUrl
    console.log('params : ', params)
    console.log('body : ', body)
    console.log('user_ip : ', user_ip)
    console.log('originalUrl : ', originalUrl)

    const keyOfBody = Object.keys(body)
    const newLine = `${user_ip} ${Object.keys(body)}`
    for (let i = 0; i < keyOfBody.length; i++) {}
    // console.log(' keyOfBody : ',keyOfBody)

    // let path = '../var/log/api.log'
    const path = 'api.log'
    fs.readFile(path, 'utf8', function (err, data) {
      let newData
      if (data) {
      } else {
      }
      fs.writeFile(path, newLine, 'utf8', function (err) {
        console.log('fs writeFile error : ', err)
      })
    })

    next()
  } catch (err) {
    next(err)
  }
}
