const { sendError } = require('../utils/apiResponses')

function notFound(req, res) {
  return sendError(res, 'Route wurde nicht gefunden.', 404)
}

module.exports = notFound
