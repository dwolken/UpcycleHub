function errorCodeForStatus(status) {
  if (status === 400) {
    return 'bad_request'
  }

  if (status === 401) {
    return 'unauthenticated'
  }

  if (status === 403) {
    return 'forbidden'
  }

  if (status === 404) {
    return 'not_found'
  }

  if (status === 409) {
    return 'conflict'
  }

  return 'internal_error'
}

function sendData(res, data, status = 200) {
  return res.status(status).json({ data })
}

function sendError(res, message, status = 500, code = errorCodeForStatus(status)) {
  return res.status(status).json({
    message,
    error: {
      message,
      status,
      code,
    },
  })
}

module.exports = {
  sendData,
  sendError,
}
