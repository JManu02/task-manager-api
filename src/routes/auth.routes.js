const express = require('express')
const router = express.Router()
const {
  registerController,
  loginController,
  refreshController,
  logoutController
} = require('../controllers/auth.controller')
const verifyToken = require('../middlewares/verifyToken')
const requireRole = require('../middlewares/requireRole')

router.post('/register', registerController)
router.post('/login', loginController)
router.post('/refresh', refreshController)
router.post('/logout', logoutController)

// Ruta de prueba
router.get('/me', verifyToken, (req, res) => {
  res.json({ message: 'Access granted', user: req.user })
})

// Ruta de prueba solo admin
router.get('/admin', verifyToken, requireRole('admin'), (req, res) => {
  res.json({ message: 'Welcome admin' })
})

module.exports = router