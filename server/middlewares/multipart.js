const multer = require('multer')
const uuid = require('uuid')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp')
  },
  filename: (req, file, cb) => {
    cb(null, uuid.v4())
  }
})

const upload = multer({storage})

module.exports = (names) => {
  if (names.length === 1) {
    return upload.array(names[0])
  }
  return upload.fields(names.map((name) => ({name})))
}
