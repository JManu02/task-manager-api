const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user.model')
const BlacklistedToken = require('../models/blacklist.model')

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )
}

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )
}

const register = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email })
  if (existingUser) throw new Error('Email already in use')

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await User.create({ name, email, password: hashedPassword, role })

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  return { accessToken, refreshToken }
}

const login = async ({ email, password }) => {
  const user = await User.findOne({ email })
  if (!user) throw new Error('Invalid credentials')

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new Error('Invalid credentials')

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  return { accessToken, refreshToken }
}

const refresh = async (token) => {
  const isBlacklisted = await BlacklistedToken.findOne({ token })
  if (isBlacklisted) throw new Error('Token invalidated')

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
  const user = await User.findById(decoded.id)
  if (!user) throw new Error('User not found')

  const accessToken = generateAccessToken(user)
  return { accessToken }
}

const logout = async (token) => {
  await BlacklistedToken.create({ token })
}

module.exports = { register, login, refresh, logout }