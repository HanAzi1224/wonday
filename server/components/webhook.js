const axios = require('axios')

module.exports.sendNotification = async (type, title, text, errorObj) => {
  let themeColor
  switch (type) {
    case 'warning':
      themeColor = 'FFCC00' // Yellow
      break
    case 'error':
      themeColor = 'EA4300' // Red
      break
    case 'success':
      themeColor = '00CC00' // Green
      break
    default:
      themeColor = '808080' // Grey
      break
  }

  const message = {
    '@type': 'MessageCard',
    '@context': 'http://schema.org/extensions',
    summary: title,
    themeColor,
    title,
    text
  }

  if (errorObj) {
    message.text += `\n\nError Details: ${JSON.stringify(errorObj, null, 2)}`
  }

  const webhookUrl = process.env.TEAMS_WEBHOOK_URL // Set your Teams Webhook URL in environment variables
  try {
    await axios.post(webhookUrl, message)
  } catch (error) {
    console.error(`Failed to send Teams notification: ${error.message}`)
  }
}
