const Schemas = require('../schemas')

async function verifyOptions(req, paths, schema, coerceTypes) {
  let options
  if (Array.isArray(req.options)) {
    options = req.options
  } else {
    options = {...req.query, ...req.body, ...req.params}
    // 항목별 파일 정보 추가
    if (req.files) {
      const filesByFieldName = req.files.reduce((acc, file) => {
        // 각 fieldname에 대응하는 배열이 없으면 초기화
        if (!acc[file.fieldname]) {
          acc[file.fieldname] = []
        }

        // 해당 fieldname의 배열에 파일 객체를 추가
        acc[file.fieldname].push(file)
        return acc
      }, {})

      // 그룹화된 파일 객체들을 options에 추가
      Object.assign(options, filesByFieldName)
    }

    if (req.file) {
      options[req.file.fieldname] = req.file
    }
  }

  try {
    if (schema) Schemas.validate(options, schema, {coerceTypes})
  } catch (e) {
    throw e
  }
  return options
}

module.exports = (path, schema, coerceTypes) => {
  return async (req, res, next) => {
    // console.log('schema', schema)
    try {
      req.options = await verifyOptions(req, path, schema, coerceTypes)
      next()
    } catch (err) {
      next(err)
    }
  }
}
