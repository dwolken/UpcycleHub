const { sendError } = require('../utils/apiResponses')

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err)
  }

  const status = Number.isInteger(err.status) ? err.status : 500
  const message =
    status >= 500
      ? 'Ein unerwarteter Fehler ist aufgetreten.'
      : err.message || 'Die Anfrage konnte nicht verarbeitet werden.'

  if (err.type === 'entity.parse.failed') {
    return sendError(res, 'Die Anfrage konnte nicht gelesen werden.', 400)
  }

  return sendError(res, message, status)
}

module.exports = errorHandler
