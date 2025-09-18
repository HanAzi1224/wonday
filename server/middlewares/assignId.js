const {v4} = require('uuid') 

module.exports = (req,res,next) => {
    try {
        req.id = v4()
        next()
    } catch (e) {
        next(e)
    }
}
