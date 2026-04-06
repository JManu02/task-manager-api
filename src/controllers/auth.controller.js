const authService = require('../services/auth.service')
const { registerSchema, loginSchema } = require('../schemas/auth.schema')

const registerController = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body)
    const tokens = await authService.register(data)
    res.status(201).json(tokens)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const loginController = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body)
    const tokens = await authService.login(data)
    res.status(200).json(tokens)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const refreshController = async (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'Token is required' })

    const result = await authService.refresh(token)
    res.status(200).json(result)
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
}

const logoutController = async (req, res) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'Token is required' })

    await authService.logout(token)
    res.status(200).json({ message: 'Logged out successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

module.exports = { registerController, loginController, refreshController, logoutController }