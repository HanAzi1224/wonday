const bcrypt = require('bcrypt-nodejs')
const {startOfDay, endOfDay} = require('date-fns')
const {zonedTimeToUtc} = require('date-fns-tz')
const jwtService = require('jsonwebtoken')
const jwt = require('../../../libs/jwt')
const db = require('../../../models')
const aligoapi = require('../../../components/sms')
const emailapi = require('../../../components/email')
const {businessNumChk} = require('../../../components/businessNum')
const {USER_TYPE, LOGIN_TYPE, GRADE} = require('../../../models/enums')

// 회원가입
module.exports.signUp = async (req, res, next) => {
  const {user_id, user_name, user_phone, user_pwd} = req.options

  const transaction = await db.sequelize.transaction()

  try {
    // 유저 아이디 중복 체크
    const userCheck = await db.Users.findOne({where: {user_id}})
    if (userCheck) throw {status: 409, errorMessage: '이미 존재하는 아이디입니다.'}

    // 비밀번호 암호화
    const salt = bcrypt.genSaltSync()
    const hashedPassword = bcrypt.hashSync(user_pwd, salt)

    // 유저 데이터 삽입
    const user = await db.Users.create(
      {
        user_id,
        user_name,
        user_phone
      },
      {transaction}
    )

    // JWT 토큰 생성
    const token = await jwt.createAccessToken({
      user_idx: user.user_idx,
      user_id
    })

    // 사용자 인증 데이터 삽입
    await db.UserAuth.create(
      {
        user_idx: user.user_idx,
        user_pwd: hashedPassword,
        user_salt: salt,
        access_token: token
      },
      {transaction}
    )

    await transaction.commit()
    // 가입자 정보에서 민감한 필드는 제외하고 필요한 정보만 추려서 응답
    const userInfo = {
      user_idx: user.user_idx,
      user_id: user.user_id,
      user_name: user.user_name,
      user_phone: user.user_phone
    }
    return res.status(200).json({result: true, token, data: userInfo})
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}

module.exports.signIn = async (req, res, next) => {
  // Extract request parameters / 요청 파라미터 추출
  const {user_id, user_pwd, fcm_token} = req.options

  // Initialize database transaction for data consistency / 데이터 일관성을 위한 트랜잭션 초기화
  const transaction = await db.sequelize.transaction()

  try {
    // STEP 1: User lookup in Users table / 1단계: Users 테이블에서 사용자 검색
    // Query without transaction as it's read-only operation / 읽기 전용 작업이므로 트랜잭션 없이 쿼리
    const user = await db.Users.findOne({
      where: {user_id}
    })

    // Early exit if user doesn't exist / 사용자가 존재하지 않으면 조기 종료
    if (!user) {
      throw {status: 404, errorMessage: '사용자를 찾을 수 없습니다.'}
    }

    // STEP 2: Retrieve authentication data from UserAuth table / 2단계: UserAuth 테이블에서 인증 데이터 조회
    // Using transaction here as we'll update this table later / 나중에 이 테이블을 업데이트하므로 트랜잭션 사용
    const userAuth = await db.UserAuth.findOne({where: {user_idx: user.user_idx}, transaction})

    if (!userAuth) {
      throw {status: 404, errorMessage: '인증 정보를 찾을 수 없습니다.'}
    }

    // Validate password field presence / 비밀번호 필드 존재 검증
    if (!user_pwd) {
      throw {status: 400, errorMessage: '비밀번호를 입력하세요.'}
    }

    // STEP 3: Password validation using bcrypt synchronous comparison / 3단계: bcrypt 동기 비교를 사용한 비밀번호 검증
    // Compares plain text password with hashed password / 평문 비밀번호와 해시된 비밀번호 비교
    const isPasswordValid = bcrypt.compareSync(user_pwd, userAuth.user_pwd)

    if (!isPasswordValid) {
      throw {status: 401, errorMessage: '비밀번호가 올바르지 않습니다.'}
    }

    // STEP 4: JWT token generation with user payload / 4단계: 사용자 정보를 담은 JWT 토큰 생성
    // Creates access token containing user identification data / 사용자 식별 데이터가 포함된 액세스 토큰 생성
    const token = await jwt.createAccessToken({
      user_idx: user.user_idx,
      user_id: user.user_id
    })

    // STEP 5: Optional FCM token update for push notifications / 5단계: 푸시 알림을 위한 FCM 토큰 업데이트 (선택사항)
    // Updates only if FCM token is provided in request / 요청에 FCM 토큰이 제공된 경우에만 업데이트
    if (fcm_token) {
      await db.Users.update({fcm_token}, {where: {user_idx: user.user_idx}, transaction})
    }

    // STEP 6: Store access token in UserAuth table for session management / 6단계: 세션 관리를 위해 UserAuth 테이블에 액세스 토큰 저장
    // Transaction ensures consistency between all updates / 트랜잭션이 모든 업데이트 간 일관성 보장
    await db.UserAuth.update({access_token: token}, {where: {user_idx: user.user_idx}, transaction})

    // STEP 7: Commit transaction and prepare success response / 7단계: 트랜잭션 커밋 및 성공 응답 준비
    // All database operations are now permanently saved / 모든 데이터베이스 작업이 영구적으로 저장됨
    await transaction.commit()

    // Prepare sanitized user information for response / 응답을 위한 사용자 정보 정제
    const userInfo = {
      user_idx: user.user_idx,
      user_id: user.user_id,
      user_name: user.user_name,
      user_phone: user.user_phone
    }

    // Return successful authentication response with token and user data / 토큰과 사용자 데이터가 포함된 인증 성공 응답 반환
    return res.status(200).json({result: true, token, data: userInfo})
  } catch (err) {
    // Error handling and transaction rollback / 에러 처리 및 트랜잭션 롤백
    console.error(err)

    // CRITICAL: Rollback all database changes on any error / 중요: 모든 에러 발생 시 데이터베이스 변경사항 롤백
    // This ensures data integrity by undoing all operations within the transaction / 트랜잭션 내 모든 작업을 취소하여 데이터 무결성 보장
    await transaction.rollback()

    // Pass error to Express error handling middleware / Express 에러 처리 미들웨어로 에러 전달
    next(err)
  }
}

module.exports.signOut = async (req, res, next) => {
  const {user_idx} = req.user // authMiddleware에서 파싱된 사용자 정보
  const transaction = await db.sequelize.transaction()
  try {
    // FCM 토큰 삭제
    await db.Users.update({fcm_token: null}, {where: {user_idx}, transaction})
    await transaction.commit()
    return res.status(200).json({result: true})
  } catch (err) {
    await transaction.rollback()
    next(err)
  }
}

module.exports.checkUserId = async (req, res, next) => {
  const {user_id} = req.options // Assuming user_id is sent as a query parameter

  try {
    // Check for existing user with the same user_id
    const existingUser = await db.Users.findOne({where: {user_id}})

    if (existingUser) {
      // User ID already exists
      throw {status: 409, errorMessage: '이미 존재하는 아이디입니다.'}
    }

    return res.status(200).json({result: true})
  } catch (err) {
    console.error(err)
    next(err)
  }
}

module.exports.findUserId = async (req, res, next) => {
  const {user_name, user_phone} = req.options

  try {
    const whereClause = {}

    if (user_name) {
      whereClause.user_name = user_name
    }

    if (user_phone) {
      whereClause.user_phone = user_phone
    }
    // 데이터베이스에서 결과 조회
    const userChk = await db.Users.findOne({
      where: whereClause
    })

    if (!userChk) {
      throw {status: 409, errorMessage: '존재하지 않는 회원 정보입니다.'}
    }

    return res.status(200).json({result: true, data: {user_name: userChk.user_name, user_id: userChk.user_id}})
  } catch (err) {
    console.error(err)
    next(err)
  }
}

// module.exports.verifyAuthSms = async (req, res, next) => {
//   const {phone, auth_number} = req.options // Assuming phone and auth_number are sent in the request body

//   try {
//     // Find the most recent SMS auth record for the given phone number
//     const smsAuthRecord = await db.SmsAuth.findOne({
//       where: {phone},
//       order: [['first_create_dt', 'DESC']]
//     })

//     if (!smsAuthRecord) {
//       throw {status: 404, errorMessage: '인증번호가 일치하지 않습니다.'}
//     }

//     // Check if the provided auth number matches the one in the record
//     if (smsAuthRecord.auth_number !== auth_number) {
//       throw {status: 404, errorMessage: '인증번호가 일치하지 않습니다.'}
//     }

//     // If the numbers match
//     res.status(200).json({result: true})
//   } catch (err) {
//     console.error(err)
//     next(err)
//   }
// }
