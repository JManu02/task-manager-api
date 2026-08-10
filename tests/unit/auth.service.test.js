jest.mock('../../src/models/user.model', () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn()
}))
jest.mock('../../src/models/blacklist.model', () => ({
  findOne: jest.fn(),
  create: jest.fn()
}))

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user.model')
const BlacklistedToken = require('../../src/models/blacklist.model')
const authService = require('../../src/services/auth.service')

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret'
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('authService.register', () => {
  it('throws when the email is already in use', async () => {
    User.findOne.mockResolvedValue({ email: 'taken@test.com' })

    await expect(
      authService.register({ name: 'Jose', email: 'taken@test.com', password: 'secret123' })
    ).rejects.toThrow('Email already in use')
  })

  it('creates a user and returns an access/refresh token pair', async () => {
    User.findOne.mockResolvedValue(null)
    User.create.mockResolvedValue({ _id: 'u1', role: 'user' })

    const result = await authService.register({
      name: 'Jose',
      email: 'jose@test.com',
      password: 'secret123'
    })

    expect(User.create).toHaveBeenCalled()
    expect(result).toHaveProperty('accessToken')
    expect(result).toHaveProperty('refreshToken')
  })
})

describe('authService.login', () => {
  it('throws on an unknown email', async () => {
    User.findOne.mockResolvedValue(null)

    await expect(
      authService.login({ email: 'ghost@test.com', password: 'secret123' })
    ).rejects.toThrow('Invalid credentials')
  })

  it('throws on a wrong password', async () => {
    const hashed = await bcrypt.hash('correct-password', 10)
    User.findOne.mockResolvedValue({ _id: 'u1', role: 'user', password: hashed })

    await expect(
      authService.login({ email: 'jose@test.com', password: 'wrong-password' })
    ).rejects.toThrow('Invalid credentials')
  })

  it('returns a token pair on valid credentials', async () => {
    const hashed = await bcrypt.hash('correct-password', 10)
    User.findOne.mockResolvedValue({ _id: 'u1', role: 'user', password: hashed })

    const result = await authService.login({ email: 'jose@test.com', password: 'correct-password' })

    expect(result).toHaveProperty('accessToken')
    expect(result).toHaveProperty('refreshToken')
  })
})

describe('authService.refresh', () => {
  it('throws when the refresh token is blacklisted', async () => {
    BlacklistedToken.findOne.mockResolvedValue({ token: 'blacklisted-token' })

    await expect(authService.refresh('blacklisted-token')).rejects.toThrow('Token invalidated')
  })

  it('throws when the token belongs to a deleted user', async () => {
    BlacklistedToken.findOne.mockResolvedValue(null)
    const token = jwt.sign({ id: 'ghost-id' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
    User.findById.mockResolvedValue(null)

    await expect(authService.refresh(token)).rejects.toThrow('User not found')
  })

  it('issues a new access token for a valid refresh token', async () => {
    BlacklistedToken.findOne.mockResolvedValue(null)
    const token = jwt.sign({ id: 'u1' }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
    User.findById.mockResolvedValue({ _id: 'u1', role: 'user' })

    const result = await authService.refresh(token)

    expect(result).toHaveProperty('accessToken')
  })
})

describe('authService.logout', () => {
  it('blacklists the given token', async () => {
    await authService.logout('some-token')

    expect(BlacklistedToken.create).toHaveBeenCalledWith({ token: 'some-token' })
  })
})
