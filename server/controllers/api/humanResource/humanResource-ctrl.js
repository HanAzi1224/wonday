const db = require('../../../models')
const {getPageData, getPageInfo} = require('../../../components/util')
const {MANAGE_TYPE} = require('../../../models/enums')

// 인사정보 생성 (Create)
module.exports.createHumanResource = async (req, res, next) => {
  const {user_idx, position, department, user_image, manage_type, employment_dt} = req.options

  const transaction = await db.sequelize.transaction()

  const {user_idx: master_user_idx} = req.jwtToken

  try {
    // 대상 유저 존재 확인
    const targetUser = await db.Users.findOne({where: {user_idx}})
    if (!targetUser) {
      throw {status: 404, errorMessage: '대상 유저를 찾을 수 없습니다.'}
    }

    // 마스터 유저 존재 확인
    const masterUser = await db.Users.findOne({where: {user_idx: master_user_idx}})
    if (!masterUser) {
      throw {status: 404, errorMessage: '등록자 유저를 찾을 수 없습니다.'}
    }

    // 이미 인사정보가 존재하는지 확인
    const existingHR = await db.HumanResource.findOne({
      where: {user_idx},
      transaction
    })
    if (existingHR) {
      throw {status: 409, errorMessage: '해당 유저의 인사정보가 이미 존재합니다.'}
    }

    // 인사정보 생성
    const humanResource = await db.HumanResource.create(
      {
        master_user_idx,
        user_idx,
        position,
        department,
        user_image,
        manage_type,
        employment_dt
      },
      {transaction}
    )

    await transaction.commit()

    res.status(201).json({
      success: true,
      message: '인사정보가 성공적으로 생성되었습니다.',
      data: humanResource
    })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

// 인사정보 목록 조회 (Read List)
module.exports.getHumanResourceList = async (req, res, next) => {
  const {manage_type, start_dt, end_dt} = req.options

  const {page, limit} = getPageData(req.options)

  try {
    const whereClause = {}

    if (manage_type) {
      whereClause.manage_type = {
        [db.Sequelize.Op.like]: `%${manage_type}%`
      }
    }

    // 날짜 범위 조건 (start_dt 이상, end_dt 이하 - 경계값 포함)
    if (start_dt && end_dt) {
      // end_dt에 하루 끝 시간 추가 (23:59:59)
      const endDateTime = new Date(end_dt)
      endDateTime.setHours(23, 59, 59, 999)

      whereClause.first_create_dt = {
        [db.Sequelize.Op.gte]: start_dt, // 시작일 이상
        [db.Sequelize.Op.lte]: endDateTime // 종료일 23:59:59 이하
      }
    } else if (start_dt) {
      whereClause.first_create_dt = {[db.Sequelize.Op.gte]: start_dt} // 시작일 이상
    } else if (end_dt) {
      // end_dt에 하루 끝 시간 추가 (23:59:59)
      const endDateTime = new Date(end_dt)
      endDateTime.setHours(23, 59, 59, 999)
      whereClause.first_create_dt = {[db.Sequelize.Op.lte]: endDateTime} // 종료일 23:59:59 이하
    }

    const {count: totalCount, rows} = await db.HumanResource.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: db.Users,
          as: 'user',
          attributes: ['user_idx', 'user_id', 'user_name', 'user_phone']
        }
      ],
      offset: (page - 1) * limit,
      limit,
      order: [['first_create_dt', 'DESC']]
    })

    const pagination = getPageInfo(totalCount, page, limit)

    return res.status(200).json({result: true, data: {rows, pagination}})
  } catch (error) {
    next(error)
  }
}

// 인사정보 상세 조회 (Read Detail)
module.exports.getHumanResourceDetail = async (req, res, next) => {
  const {human_resource_idx} = req.options

  try {
    const humanResource = await db.HumanResource.findOne({
      where: {human_resource_idx},
      include: [
        {
          model: db.Users,
          as: 'user',
          attributes: ['user_idx', 'user_id', 'user_name', 'user_phone']
        }
      ]
    })

    if (!humanResource) {
      throw {status: 404, errorMessage: '인사정보를 찾을 수 없습니다.'}
    }

    res.status(200).json({
      success: true,
      data: humanResource
    })
  } catch (error) {
    next(error)
  }
}

// 인사정보 수정 (Update)
module.exports.updateHumanResource = async (req, res, next) => {
  const {human_resource_idx, position, department, user_image, manage_type, employment_dt} = req.options

  const transaction = await db.sequelize.transaction()

  try {
    // 인사정보 존재 확인
    const humanResource = await db.HumanResource.findOne({
      where: {human_resource_idx},
      transaction
    })

    if (!humanResource) {
      throw {status: 404, errorMessage: '인사정보를 찾을 수 없습니다.'}
    }

    // 수정할 데이터 준비
    const updateData = {}
    if (position !== undefined) updateData.position = position
    if (department !== undefined) updateData.department = department
    if (user_image !== undefined) updateData.user_image = user_image
    if (manage_type !== undefined) updateData.manage_type = manage_type
    if (employment_dt !== undefined) updateData.employment_dt = employment_dt

    // 인사정보 수정
    await humanResource.update(updateData, {transaction})

    await transaction.commit()

    // 수정된 데이터 조회
    const updatedHumanResource = await db.HumanResource.findOne({
      where: {human_resource_idx},
      include: [
        {
          model: db.Users,
          as: 'user',
          attributes: ['user_idx', 'user_id', 'user_name', 'user_phone']
        }
      ]
    })

    res.status(200).json({
      success: true,
      message: '인사정보가 성공적으로 수정되었습니다.',
      data: updatedHumanResource
    })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

// 인사정보 삭제 (Delete - Soft Delete)
module.exports.deleteHumanResource = async (req, res, next) => {
  const {human_resource_idx} = req.options

  const transaction = await db.sequelize.transaction()

  try {
    // 인사정보 존재 확인
    const humanResource = await db.HumanResource.findOne({
      where: {human_resource_idx},
      transaction
    })

    if (!humanResource) {
      throw {status: 404, errorMessage: '인사정보를 찾을 수 없습니다.'}
    }

    // Soft Delete 수행
    await humanResource.destroy({transaction})

    await transaction.commit()

    res.status(200).json({
      success: true,
      message: '인사정보가 성공적으로 삭제되었습니다.'
    })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

// humanResource에 등록되지 않은 유저 조회
module.exports.getNoneRegisteredUsers = async (req, res, next) => {
  try {
    const users = await db.Users.findAll({
      attributes: ['user_idx', 'user_id', 'user_name', 'user_phone'],
      order: [['user_idx', 'ASC']]
    })

    const humanResources = await db.HumanResource.findAll({
      attributes: ['user_idx'],
      order: [['user_idx', 'ASC']]
    })

    const registeredUserIds = new Set(humanResources.map((hr) => hr.user_idx))

    const noneRegisteredUsers = users.filter((user) => !registeredUserIds.has(user.user_idx))

    res.status(200).json({
      success: true,
      data: noneRegisteredUsers,
      message: `전체 ${users.length}명 중 인사정보에 등록되지 않은 유저 ${noneRegisteredUsers.length}명을 조회했습니다.`
    })
  } catch (error) {
    next(error)
  }
}
