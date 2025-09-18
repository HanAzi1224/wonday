const Nodemailer = require('nodemailer')
const config = require('../config')

module.exports.sendEmail = async (sender, context, template) => {
  const transporter = Nodemailer.createTransport({
    service: config.email.service,
    auth: {
      user: config.email.user,
      pass: config.email.pass
    }
  })

  let mailOptions = {}
  switch (template) {
    case 'change_password':
      mailOptions = {
        from: config.email.user,
        to: sender,
        subject: '비밀번호 재설정',
        html: `<p><a href="${context}"> 다음 링크</a>를 통해 비밀번호를 변경해 주세요.</p>`
      }
      break
    default:
      //   console.log(`Unknown template: ${template}`)
      return false
  }
  try {
    const info = await transporter.sendMail(mailOptions)
    // console.log('Message sent:', info)
    return true
  } catch (error) {
    // console.log('SendMail error:', error)
    return false
  }
}
