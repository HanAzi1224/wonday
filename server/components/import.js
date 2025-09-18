const axios = require('axios')

module.exports.issueBilling = async (cardInfo) => {
  const fullYear = 2000 + parseInt(cardInfo.expire_y, 10)
  const expiry = `${fullYear}-${cardInfo.expire_m}`
  const customer_uid = cardInfo.customer_uid
  const importTokenUrl = 'https://api.iamport.kr/users/getToken'
  const importBillingIssueUrl = `https://api.iamport.kr/subscribe/customers/${customer_uid}`

  try {
    // 토큰 먼저 받기
    // console.log('cardInfo', cardInfo)
    const getTokenResponse = await axios.post(
      importTokenUrl,
      {
        imp_key: process.env.IMP_REST_API,
        imp_secret: process.env.IMP_REST_API_SECRET
      },
      {
        headers: {'Content-Type': 'application/json'}
      }
    )

    const {access_token} = getTokenResponse.data.response

    // 빌링키 발급 요청
    const issueBillingResponse = await axios.post(
      importBillingIssueUrl,
      {
        pg: 'daou.CTS17266', //kcp : kcp_billing.A52LD, 일반 다우: CTS17362, 정기 다우: CTS17266
        card_number: cardInfo.card_num,
        expiry,
        birth: cardInfo.card_info_num, // 필수
        pwd_2digit: cardInfo.card_pwd
      },
      {
        headers: {Authorization: access_token}
      }
    )
    // console.log('issueBillingResponse', issueBillingResponse)

    const {code, message} = issueBillingResponse.data
    if (code !== 0) {
      throw {status: 404, errorMessage: '잘못된 카드 정보 입니다.'}
    }

    // 빌링키 발급 성공
    return {
      result: true,
      customer_uid,
      billingkey_result: 'success',
      cardInfo: issueBillingResponse.data.response
    }
  } catch (err) {
    console.error('Error during billing issue:', err)
    return {
      result: false,
      error: {status: err.status || 404, errorMessage: err.errorMessage || '카드 등록 중 에러가 발생했습니다.'}
    }
  }
}

module.exports.payAgain = async (payInfo) => {
  const importTokenUrl = 'https://api.iamport.kr/users/getToken'
  const payAgainUrl = 'https://api.iamport.kr/subscribe/payments/again'

  try {
    // 토큰 먼저 받기
    const getTokenResponse = await axios.post(
      importTokenUrl,
      {
        imp_key: process.env.IMP_REST_API,
        imp_secret: process.env.IMP_REST_API_SECRET
      },
      {
        headers: {'Content-Type': 'application/json'}
      }
    )

    const {access_token} = getTokenResponse.data.response

    // 비인증 결제 요청
    const payResult = await axios.post(
      payAgainUrl,
      {
        customer_uid: payInfo.customer_uid,
        merchant_uid: payInfo.merchant_uid,
        amount: payInfo.amount,
        name: 'ORCA 정기결제'
      },
      {
        headers: {Authorization: access_token}
      }
    )

    const {code, message} = payResult.data
    //아임포트 자체 결제 실패인 경우, pg사 및 카드 이슈이면 실패 결과값 나옴
    if (code !== 0) {
      throw new Error(`Pay failed: ${message}`)
    }

    return {
      result: true,
      info: payResult.data,
      pay_result: payResult.data.response.status
    }
  } catch (err) {
    console.error('Error during payment:', err)
    throw err // 에러를 상위 호출자에게 전파
  }
}

// module.exports.requestPay = async () => {
//   const importTokenUrl = 'https://api.iamport.kr/users/getToken'
//   const url = 'https://cdn.iamport.kr/v1/iamport.js'

//   try {
//     // 토큰 먼저 받기
//     const getTokenResponse = await axios.post(
//       importTokenUrl,
//       {
//         imp_key: process.env.IMP_REST_API,
//         imp_secret: process.env.IMP_REST_API_SECRET
//       },
//       {
//         headers: {'Content-Type': 'application/json'}
//       }
//     )

//     const {access_token} = getTokenResponse.data.response

//     const paymentResult = await axios.post(
//       url,
//       {
//         pg: 'daou.CTS17266', //kcp : kcp_billing.A52LD
//         pay_method: 'card',
//         merchant_uid: 'ORD20180131-0000011', // 주문번호
//         name: '노르웨이 회전 의자',
//         amount: 100, // 숫자 타입
//         buyer_email: 'gildong@gmail.com',
//         buyer_name: '홍길동',
//         buyer_tel: '010-4242-4242',
//         buyer_addr: '서울특별시 강남구 신사동',
//         buyer_postcode: '01181'
//       },
//       {
//         headers: {Authorization: access_token, 'Content-Type': 'application/json'}
//       }
//     )

//     // console.log('Payment result:', paymentResult.data)
//     return paymentResult.data
//   } catch (error) {
//     console.error('Error during payment request:', error)
//     return {result: false, error: error.response.data}
//   }
// }
