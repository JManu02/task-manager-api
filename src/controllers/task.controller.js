const taskService = require('../services/task.service')
const { createTaskSchema, updateTaskSchema } = require('../schemas/task.schema')

const getAllTasks = async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks(req.user.id, req.user.role)
    res.status(200).json(tasks)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

const getTaskById = async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user.id, req.user.role)
    res.status(200).json(task)
  } catch (error) {
    const status = error.message === 'Task not found' ? 404 : 403
    res.status(status).json({ error: error.message })
  }
}

const createTask = async (req, res) => {
  try {
    const data = createTaskSchema.parse(req.body)
    const task = await taskService.createTask(data, req.user.id)
    res.status(201).json(task)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const updateTask = async (req, res) => {
  try {
    const data = updateTaskSchema.parse(req.body)
    const task = await taskService.updateTask(req.params.id, data, req.user.id, req.user.role)
    res.status(200).json(task)
  } catch (error) {
    const status = error.message === 'Task not found' ? 404 : 403
    res.status(status).json({ error: error.message })
  }
}

const deleteTask = async (req, res) => {
  try {
    await taskService.deleteTask(req.params.id, req.user.id, req.user.role)
    res.status(200).json({ message: 'Task deleted successfully' })
  } catch (error) {
    const status = error.message === 'Task not found' ? 404 : 403
    res.status(status).json({ error: error.message })
  }
}

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask }