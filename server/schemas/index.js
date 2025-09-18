const Ajv = require('ajv')
const fs = require('fs')
const path = require('path')
// eslint-disable-next-line import/no-extraneous-dependencies
const ajvErrors = require('ajv-errors')
const localize = require('ajv-i18n')
const logger = require('../loaders/logger')

// 날짜 형식을 검증하는 함수
function validateDateFormat(date) {
  // YYYY-MM-DD 형식의 정규 표현식
  const regex = /^\d{4}-\d{2}-\d{2}$/
  return regex.test(date)
}

// binary 검증
function validateBinary(data) {
  return Buffer.isBuffer(data)
}

function preprocessData(originalData) {
  // 새로운 객체를 생성하여 기존 데이터를 복사합니다.
  const newData = {...originalData}

  // 모든 키를 순회하면서 검사합니다.
  Object.keys(newData).forEach((key) => {
    const value = newData[key]
    // 해당 키의 값이 객체인지 확인합니다.
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // 필수 키들의 배열입니다.
      const requiredKeys = [
        'fieldname',
        'originalname',
        'encoding',
        'mimetype',
        'destination',
        'filename',
        'path',
        'size'
      ]

      // 모든 필수 키들이 객체에 존재하는지 확인합니다.
      const hasAllRequiredKeys = requiredKeys.every((k) => k in value)

      // 필수 키들을 모두 포함하는 경우
      if (hasAllRequiredKeys) {
        // 해당 객체를 문자열로 변환합니다.
        newData[key] = 'string' // 'string' 대신 실제 파일 경로나 식별자를 사용할 수 있습니다.
      }
    }
  })

  // 변환된 새로운 객체를 리턴합니다.
  return newData
}

const entries = assignAllJson(__dirname, [])
const defaultAjv = new Ajv({
  schemas: entries,
  useDefaults: true,
  removeAdditional: true,
  coerceTypes: 'array',
  allErrors: true,
  strict: false,
  $data: true
  // formats: {'date-time': true}
})
defaultAjv.addFormat('date-time', {
  validate: validateDateFormat,
  type: 'string'
})

defaultAjv.addFormat('binary', {
  validate: validateBinary,
  type: 'object' // binary 데이터는 주로 string 타입으로 표현되므로 해당 타입으로 설정합니다.
})

ajvErrors(defaultAjv, {singleError: true, keepErrors: false})

// const defaultAjv = new Ajv({useDefaults: true, removeAdditional: true, coerceTypes: 'array'})

function getReferences(obj, ref) {
  const ret = []
  Object.entries(obj).forEach(([key, value]) => {
    if (obj[key] instanceof Object) ret.push(...getReferences(obj[key], ref))
    else if (key === ref) ret.push(obj[key])
  })
  // console.log('ret',ret)
  return ret
}

function assignAllJson(dir, all) {
  try {
    fs.readdirSync(dir).forEach((target) => {
      // console.log('dir',dir)
      // console.log('target',target)
      const targetDir = path.join(dir, target)
      if (fs.statSync(targetDir).isDirectory()) {
        assignAllJson(targetDir, all)
      } else if (target.endsWith('.json')) {
        // console.log('dir',dir)
        // console.log('all',all)

        const key = targetDir.replace('.json', '')
        const file = fs.readFileSync(`${key}.json`)
        // console.log('file',file)
        const schema = JSON.parse(file.toString())
        const idKey = targetDir.replace(`${__dirname}/`, '').replace('.json', '')
        // console.log('idKey',idKey)
        schema.$id = idKey
        const refs = getReferences(schema, '$ref')
        schema.components = {schemas: {}}
        // console.log('refs',refs)
        refs.forEach((ref) => {
          // console.log('ref',ref)
          if (ref.startsWith('#/components/schemas/')) {
            const refId = ref.replace('#/components/schemas/', '').replace(/~0/g, '~').replace(/~1/g, '/')
            // console.log('refId',refId)
            schema.components.schemas[refId] = getSchema(refId)
          }
        })
        all.push(schema)
      }
    })
  } catch (e) {
    logger.fatal(e)
  }
  return all
}

function getSchema(id) {
  // console.log('id',id)
  // console.log('path.join(__dirname, `${id}.json`)',path.join(__dirname, `${id}.json`))
  const file = fs.readFileSync(path.join(__dirname, `${id}.json`))
  return JSON.parse(file.toString())
}

function getSchemas(source) {
  return [
    ...assignAllJson(path.join(__dirname, 'request'), []),
    ...assignAllJson(path.join(__dirname, 'response'), []),
    ...assignAllJson(path.join(__dirname, 'common'), [])
  ]
}

function validate(data, schema, options) {
  const validate = defaultAjv.getSchema(schema)
  const validateData = preprocessData(data)
  if (!validate) throw new Error('undefined_schema')
  if (!validate(validateData)) {
    localize.ko(validate.errors)
    throw {
      status: 400,
      request: data,
      errorMessage: defaultAjv.errorsText(validate.errors)
    }
  }
}

module.exports = {
  // entry: assignAllJson(__dirname, {}),
  // convert,
  validate,
  getSchema,
  getSchemas
}
