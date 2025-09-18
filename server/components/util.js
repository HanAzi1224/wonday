const CryptoJS = require('crypto-js')
const bwipjs = require('bwip-js')
const uuid = require('uuid')
const axios = require('axios')
const {zonedTimeToUtc, format} = require('date-fns-tz')
const {addMonths} = require('date-fns')
const crypto = require('crypto')
const path = require('path')
const s3 = require('../components/s3')

module.exports.aesEncryption = (val) => {
  const algorithm = 'aes-256-cbc'
  const password = process.env.ENCRYPT_PASSWORD
  const salt = process.env.ENCRYPT_SALT
  const key = crypto.scryptSync(password, salt, 32)
  // console.log("key : ", key)
  // Use `crypto.randomBytes()` to generate a random iv instead of the static iv
  // const iv = Buffer.alloc(16, 0); // Initialization vector.
  const iv = crypto.randomBytes(8).toString('hex')
  // const iv = crypto.randomBytes(32).toString('base64')
  // const iv = crypto.randomBytes(32)
  // console.log("iv : ", iv)

  const cipher = crypto.createCipheriv(algorithm, key, iv) //string, buffer, hex
  // console.log("cipher : ", cipher)

  let encrypted = cipher.update(val, 'utf8', 'base64')
  // console.log("encrypted : ", encrypted) //buffer

  encrypted += cipher.final('base64')
  // console.log("encrypted : ", encrypted)

  return `${iv}:${encrypted}`
}

module.exports.aesDecryption = (val) => {
  const textParts = val.split(':')
  // console.log('textParts : ', textParts)

  const algorithm = 'aes-256-cbc'
  const password = process.env.ENCRYPT_PASSWORD
  const salt = process.env.ENCRYPT_SALT
  const key = crypto.scryptSync(password, salt, 32)
  // console.log("key : ", key)

  // Use `crypto.randomBytes()` to generate a random iv instead of the static iv
  // const iv = Buffer.alloc(16, 0); // Initialization vector.
  const iv = textParts[0]
  // const iv = crypto.randomBytes(32).toString('base64')
  // const iv = crypto.randomBytes(32)
  // console.log("iv : ", iv)

  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  // console.log("decipher : ", decipher)

  let decrypted = decipher.update(textParts[1], 'base64', 'utf8')
  // console.log("decrypted : ", decrypted)

  decrypted += decipher.final('utf8')
  // console.log("decrypted : ", decrypted)

  return decrypted
}

module.exports.createTempPassword = (length) => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'
  let randNum = null
  let tempPassword = ''
  for (let i = 0; i < length; i++) {
    randNum = Math.floor(Math.random() * chars.length)
    tempPassword += chars.substring(randNum, randNum + 1)
  }
  return tempPassword
}

module.exports.makePageData = (listTotal = 0, currentPage = 1, block) => {
  const pageBlock = !block || block < 0 ? 10 : block
  const totalPage = Math.ceil(listTotal / pageBlock)
  const currentBlock = Math.ceil(currentPage / pageBlock)
  const totalBlock = Math.ceil(totalPage / pageBlock)

  return {
    cur_page: currentPage,
    block: pageBlock,
    totalpage: totalPage,
    total: listTotal,
    cur_block: currentBlock,
    total_block: totalBlock
  }
}

// module.exports.getCurrentTime = () => {
//   let date = new Date().toLocaleString('en-US', {timeZone: 'Asia/Seoul'})
//   date = new Date(date)

//   Date.prototype.YYYYMMDDHHMMSS = function () {
//     const yyyy = this.getFullYear().toString()
//     const MM = pad(this.getMonth() + 1, 2)
//     const dd = pad(this.getDate(), 2)
//     const hh = pad(this.getHours(), 2)
//     const mm = pad(this.getMinutes(), 2)
//     const ss = pad(this.getSeconds(), 2)

//     return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`
//   }
//   function pad(number, length) {
//     let str = `${number}`
//     while (str.length < length) {
//       str = `0${str}`
//     }
//     return str
//   }
//   return date.YYYYMMDDHHMMSS()
// }

module.exports.calculateTimeInHour = (hour) => {
  let date = new Date().toLocaleString('en-US', {timeZone: 'Asia/Seoul'})
  date = new Date(date)

  // Add the specified hours to the current date
  date.setHours(date.getHours() + hour)

  Date.prototype.YYYYMMDDHHMMSS = function () {
    const yyyy = this.getFullYear().toString()
    const MM = pad(this.getMonth() + 1, 2)
    const dd = pad(this.getDate(), 2)
    const hh = pad(this.getHours(), 2)
    const mm = pad(this.getMinutes(), 2)
    const ss = pad(this.getSeconds(), 2)

    return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`
  }
  function pad(number, length) {
    let str = `${number}`
    while (str.length < length) {
      str = `0${str}`
    }
    return str
  }
  return date.YYYYMMDDHHMMSS()
}

module.exports.zerofill = (width, number, pad) => {
  //zerofill
  if (number === undefined) {
    return function (number, pad) {
      return this.zeroFill(width, number, pad)
    }
  }
  if (pad === undefined) pad = '0'
  width -= number.toString().length
  if (width > 0) return new Array(width + (/\./.test(number) ? 2 : 1)).join(pad) + number
  return `${number}`
}

module.exports.generateBarcode = (barcodeNum) => {
  return new Promise((resolve, reject) => {
    // 바코드 이미지 생성
    bwipjs.toBuffer(
      {
        bcid: 'code128',
        text: barcodeNum,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: 'center'
      },
      async (err, png) => {
        if (err) {
          reject(err)
        } else {
          const path = `barcode/${uuid.v4()}.png`
          const url = s3.generatePreSignedUrl({key: path, mimetype: 'image/png'})

          // AWS 버킷에 이미지 저장
          try {
            await axios.put(url, png, {
              headers: {
                'Content-Type': 'image/png',
                'Access-Control-Allow-Origin': '*'
              }
            })
            resolve(path) // 이미지 경로 반환
          } catch (error) {
            reject(error)
          }
        }
      }
    )
  })
}

module.exports.getCurrentTime = () => {
  const dateStr = format(zonedTimeToUtc(new Date(), 'Asia/Seoul'), 'yyyy-MM-dd HH:mm:ss')
  return dateStr
}

// 한 달 후의 날짜를 구하는 함수 추가
module.exports.getOneMonthLater = () => {
  const now = new Date()
  const oneMonthLaterDate = addMonths(now, 1)

  // 시간을 23:59:59로 설정
  oneMonthLaterDate.setHours(23, 59, 59, 999)

  // 설정한 시간을 UTC로 변환
  const utcDate = zonedTimeToUtc(oneMonthLaterDate, 'Asia/Seoul')
  const dateStr = format(utcDate, 'yyyy-MM-dd HH:mm:ss')
  return dateStr
}

module.exports.getPageData = (options) => {
  const page = Number(options.page) || 1
  const limit = Number(options.limit) || 10
  const offset = (page - 1) * limit
  return {page, limit, offset}
}

module.exports.getPageInfo = (total, currentPage, limit) => {
  const totalPage = Math.ceil(total / limit)
  const currentBlock = Math.ceil(currentPage / limit)
  const totalBlock = Math.ceil(totalPage / limit)
  return {
    total,
    current_page: currentPage,
    total_page: Math.ceil(total / limit),
    block: limit,
    current_block: currentBlock,
    total_block: totalBlock
  }
}

// binary 검증
module.exports.validateBinary = (data) => {
  return Buffer.isBuffer(data)
}
