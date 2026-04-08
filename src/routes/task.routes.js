const express = require('express')
const router = express.Router()
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/task.controller')
const verifyToken = require('../middlewares/verifyToken')
const requireRole = require('../middlewares/requireRole')

router.use(verifyToken)

router.get('/', getAllTasks)
router.get('/:id', getTaskById)
router.post('/', createTask)
router.put('/:id', updateTask)
router.delete('/:id', requireRole('admin'), deleteTask)

module.exports = router