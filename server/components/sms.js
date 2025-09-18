// eslint-disable-next-line import/no-extraneous-dependencies
const aligoapi = require('aligoapi')
const util = require('./util')

module.exports.sendAligo = async ({template, auth_number, fail_reason, receiver}, req) => {
  const AuthData = {
    key: process.env.ALIGO_APIKEY, // API key
    user_id: process.env.ALIGO_ID // User ID
  }

  if (!template) return false

  let message = ''
  switch (template) {
    case 1:
      message = `인증번호는 ${auth_number} 입니다`
      break
    case 2:
      message = `다음 반려 사유 확인 후 재가입 요청 부탁 드립니다.\n${fail_reason}`
      break
    default:
      message = '' // Default message or error handling
  }

  req.body = {
    sender: process.env.ALIGO_SENDER,
    receiver, // Comma-separated list for up to 1000 recipients
    msg: message
  }

  return new Promise((resolve) => {
    aligoapi
      .send(req, AuthData)
      .then((data) => {
        // 1) 알리고가 준 응답을 콘솔에 출력
        console.log('Aligo response:', data)

        // 2) 응답 메시지가 'success'라면 resolve(true), 아니면 resolve(false)
        if (data?.message === 'success') {
          resolve(true)
        }
        resolve(false)
      })
      .catch((error) => {
        // 3) 에러도 콘솔에 출력
        console.error('Aligo error:', error)
        resolve(false)
      })
  })
}
