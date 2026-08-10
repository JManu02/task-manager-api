jest.mock('../../src/models/task.model', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}))

const Task = require('../../src/models/task.model')
const taskService = require('../../src/services/task.service')

afterEach(() => {
  jest.clearAllMocks()
})

describe('taskService.getAllTasks', () => {
  it('returns every task for an admin', async () => {
    const populate = jest.fn().mockResolvedValue([{ title: 'a' }, { title: 'b' }])
    Task.find.mockReturnValue({ populate })

    const result = await taskService.getAllTasks('admin1', 'admin')

    expect(Task.find).toHaveBeenCalledWith()
    expect(result).toHaveLength(2)
  })

  it('returns only the tasks owned by a regular user', async () => {
    const populate = jest.fn().mockResolvedValue([{ title: 'a' }])
    Task.find.mockReturnValue({ populate })

    await taskService.getAllTasks('user1', 'user')

    expect(Task.find).toHaveBeenCalledWith({ owner: 'user1' })
  })
})

describe('taskService.getTaskById', () => {
  it('throws when the task does not exist', async () => {
    Task.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) })

    await expect(taskService.getTaskById('t1', 'user1', 'user')).rejects.toThrow('Task not found')
  })

  it('throws access denied for a non-owner, non-admin user', async () => {
    const task = { owner: { _id: { toString: () => 'other-user' } } }
    Task.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(task) })

    await expect(taskService.getTaskById('t1', 'user1', 'user')).rejects.toThrow('Access denied')
  })

  it('returns the task for its owner', async () => {
    const task = { owner: { _id: { toString: () => 'user1' } } }
    Task.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(task) })

    const result = await taskService.getTaskById('t1', 'user1', 'user')

    expect(result).toBe(task)
  })
})

describe('taskService.createTask', () => {
  it('creates a task owned by the requesting user', async () => {
    Task.create.mockResolvedValue({ title: 'New task', owner: 'user1' })

    const result = await taskService.createTask({ title: 'New task' }, 'user1')

    expect(Task.create).toHaveBeenCalledWith({ title: 'New task', owner: 'user1' })
    expect(result.owner).toBe('user1')
  })
})

describe('taskService.updateTask', () => {
  it('throws when the task does not exist', async () => {
    Task.findById.mockResolvedValue(null)

    await expect(taskService.updateTask('t1', {}, 'user1', 'user')).rejects.toThrow('Task not found')
  })

  it('throws access denied for a non-owner, non-admin user', async () => {
    Task.findById.mockResolvedValue({ owner: { toString: () => 'other-user' } })

    await expect(taskService.updateTask('t1', {}, 'user1', 'user')).rejects.toThrow('Access denied')
  })

  it('allows an admin to update a task owned by someone else', async () => {
    Task.findById.mockResolvedValue({ owner: { toString: () => 'other-user' } })
    Task.findByIdAndUpdate.mockResolvedValue({ title: 'Updated' })

    const result = await taskService.updateTask('t1', { title: 'Updated' }, 'admin1', 'admin')

    expect(result.title).toBe('Updated')
  })
})

describe('taskService.deleteTask', () => {
  it('throws when the task does not exist', async () => {
    Task.findById.mockResolvedValue(null)

    await expect(taskService.deleteTask('t1', 'user1', 'user')).rejects.toThrow('Task not found')
  })

  it('throws access denied for a non-owner, non-admin user', async () => {
    Task.findById.mockResolvedValue({ owner: { toString: () => 'other-user' } })

    await expect(taskService.deleteTask('t1', 'user1', 'user')).rejects.toThrow('Access denied')
  })

  it('deletes the task when requested by its owner', async () => {
    Task.findById.mockResolvedValue({ owner: { toString: () => 'user1' } })
    Task.findByIdAndDelete.mockResolvedValue({})

    await taskService.deleteTask('t1', 'user1', 'user')

    expect(Task.findByIdAndDelete).toHaveBeenCalledWith('t1')
  })
})
