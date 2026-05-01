function notFound(req, res) {
  res.status(404).json({
    message: 'Route wurde nicht gefunden.',
  })
}

module.exports = notFound
