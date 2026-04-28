function errorHandler(err, req, res, next) {
  const status = err.status || 500

  res.status(status).json({
    message: err.message || 'Ein unerwarteter Fehler ist aufgetreten.',
  })
}

module.exports = errorHandler
