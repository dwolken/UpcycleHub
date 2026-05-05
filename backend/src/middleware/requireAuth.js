const { sendError } = require('../utils/apiResponses')

function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return sendError(res, 'Bitte melde dich an, um fortzufahren.', 401)
  }

  return next()
}

module.exports = requireAuth
