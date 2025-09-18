const fcm = require('./firebase/index')

module.exports.sendToTopic = async (options) => {
  try {
    console.log('sendToTopic')
    // console.log(options)
    fcm.messaging().send(options).then()
  } catch (err) {
    throw new Error(err)
    // console.log(err)
  }
}

module.exports.sendToCall = async (options) => {
  try {
    // const message = {
    //   notification: {
    //     title: options.title,
    //     body: options.msg
    //   },
    //   data: {userInfo: JSON.stringify(options.data)},
    //   topic: options.topic.toString()
    // }
    // console.log('sendToCall')
    // console.log(options)
    await fcm.messaging().send(options)
  } catch (err) {
    throw new Error(err)
    // console.log(err)
  }
}

module.exports.convertMessage = (title, body, data, sendUserInfo, isPush = false) => {
  return {
    notification: {
      title,
      body
    },
    data: {
      message: isPush ? JSON.stringify(data) : data,
      type: 'text',
      sendUserInfo: isPush ? JSON.stringify(sendUserInfo) : sendUserInfo
    }
  }
}

module.exports.convertCall = (title, body, topic, sendUserInfo, callData) => {
  return {
    notification: {
      title,
      body
    },
    data: {
      type: 'call',
      sendUserInfo: JSON.stringify(sendUserInfo),
      call: JSON.stringify(callData)
    },
    topic: topic.toString()
  }
}

module.exports.testSendToTopic = async (options) => {
  try {
    // console.log('testSendToTopic')
    // console.log(options)
    fcm
      .messaging()
      .send({
        notification: {
          body: options.msg
        },
        topic: options.topic.toString()
      })
      .then()
  } catch (err) {
    // console.log("push error : ", err)
    throw new Error(err)
  }
}

module.exports.sendToDevice = async (options) => {
  try {
    console.log('sendToDevice')
    // console.log(options)
    const message = {
      // notification: {
      //   title: options.title,
      //   body: options.body
      // },
      data: options.data
      // topic:options.topic
    }
    // if(options.topic)
    //   message.topic = options.topic
    // if(options.fcm_token){
    //   message.registration_ids = [options.fcm_token]
    // }
    console.log('message', message)

    const result = await fcm
      .messaging()
      .sendToDevice(options.fcm_token, message)
      .then((res) => {
        console.log('res', res)
        if (res.failureCount !== 0) return false
        return true
      })
      .catch((err) => {
        console.error('err', err)
        return false
      })
    console.log('result', result)
    return result
  } catch (err) {
    console.log(err)
    return false
  }
}

module.exports.sendToToken = async ({title, body, data, fcm_token}) => {
  try {
    // console.log(options)
    const message = {
      notification: {
        title,
        body
      },
      data,
      token: fcm_token
    }

    const result = await fcm
      .messaging()
      .send(message)
      .then((res) => {
        console.log('res', res)
        // if (res.failureCount !== 0) return false
        return true
      })
      .catch((err) => {
        console.error('err', err)
        return false
      })
    return result
  } catch (err) {
    console.log(err)
    return false
  }
}
