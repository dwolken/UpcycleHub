function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({
      message: 'Bitte melde dich an.',
    })
  }

  return next()
}

module.exports = requireAuth
