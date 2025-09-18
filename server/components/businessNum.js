const axios = require('axios')

module.exports.businessNumChk = async (bNumArr) => {
  const gokr_key = process.env.GOKR_KEY
  const ntsurl = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${gokr_key}`

  // const ntsurl =
  //   'https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=y1BEY16KqFl78WSsjWd24GC4Txbb2djR635CMnmIuX0HtRTM5v6dELcD8AQQhYQLEDohYwCTmnDg7HkXsS7rLA%3D%3D'

  // {
  //   businesses: [{b_no: '7238601085', p_nm: '이다한', start_dt: '20180525'}]
  // },

  try {
    const numChk = await axios.post(
      ntsurl,
      {
        b_no: bNumArr
      },
      {
        headers: {'Content-Type': 'application/json'}
      }
    )
    console.log('numChk', numChk.data.data)
    if ((numChk.data.data.length > 0 && !numChk.data.data[0].tax_type_cd) || numChk.data.data[0].tax_type === '') {
      return {success: false, message: '국세청에 등록되지 않은 사업자등록번호입니다.'}
    }
    if (numChk.data.data.length > 0 && numChk.data.data[0].tax_type_cd.length > 0) {
      return {success: true}
    }
  } catch (error) {
    console.error(`Failed to send Teams notification: ${error.message}`)
    return false
  }
}
