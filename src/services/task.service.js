const Task = require('../models/task.model')

const getAllTasks = async (userId, role) => {
  if (role === 'admin') {
    return await Task.find().populate('owner', 'name email')
  }
  return await Task.find({ owner: userId }).populate('owner', 'name email')
}

const getTaskById = async (taskId, userId, role) => {
  const task = await Task.findById(taskId).populate('owner', 'name email')
  if (!task) throw new Error('Task not found')

  if (role !== 'admin' && task.owner._id.toString() !== userId) {
    throw new Error('Access denied')
  }

  return task
}

const createTask = async (data, userId) => {
  const task = await Task.create({ ...data, owner: userId })
  return task
}

const updateTask = async (taskId, data, userId, role) => {
  const task = await Task.findById(taskId)
  if (!task) throw new Error('Task not found')

  if (role !== 'admin' && task.owner.toString() !== userId) {
    throw new Error('Access denied')
  }

  const updated = await Task.findByIdAndUpdate(taskId, data, { new: true })
  return updated
}

const deleteTask = async (taskId, userId, role) => {
  const task = await Task.findById(taskId)
  if (!task) throw new Error('Task not found')

  if (role !== 'admin' && task.owner.toString() !== userId) {
    throw new Error('Access denied')
  }

  await Task.findByIdAndDelete(taskId)
}

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask }