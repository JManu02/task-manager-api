const jwt = require('jsonwebtoken')
const BlacklistedToken = require('../models/blacklist.model')

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]

    const isBlacklisted = await BlacklistedToken.findOne({ token })
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token invalidated' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = verifyToken