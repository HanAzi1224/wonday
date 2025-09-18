module.exports = async (req, res, next, headers) => {
  try {
    if (headers?.length > 0) {
      headers.forEach((header) => {
        req.options = {...req.options, [header]: req.headers[header]}
      })
    }
    next()
  } catch (err) {
    next(err)
  }
}
