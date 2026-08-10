const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

process.env.JWT_SECRET = 'test-secret'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'

const app = require('../../src/app')

let mongoServer

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
})

afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

const userData = { name: 'Jose Varela', email: 'jose@test.com', password: 'secret123' }

describe('POST /api/auth/register', () => {
  it('creates a user and returns a token pair', async () => {
    const res = await request(app).post('/api/auth/register').send(userData)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('accessToken')
    expect(res.body).toHaveProperty('refreshToken')
  })

  it('rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send(userData)
    const res = await request(app).post('/api/auth/register').send(userData)

    expect(res.status).toBe(400)
  })
})

describe('Authenticated flow', () => {
  it('logs in and accesses a protected route with the access token', async () => {
    await request(app).post('/api/auth/register').send(userData)
    const loginRes = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: userData.password
    })

    expect(loginRes.status).toBe(200)

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)

    expect(meRes.status).toBe(200)
  })

  it('rejects a protected route without a token', async () => {
    const res = await request(app).get('/api/auth/me')

    expect(res.status).toBe(401)
  })

  it('blocks a regular user from the admin-only route', async () => {
    await request(app).post('/api/auth/register').send(userData)
    const loginRes = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: userData.password
    })

    const res = await request(app)
      .get('/api/auth/admin')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)

    expect(res.status).toBe(403)
  })

  it('invalidates a refresh token after logout', async () => {
    await request(app).post('/api/auth/register').send(userData)
    const loginRes = await request(app).post('/api/auth/login').send({
      email: userData.email,
      password: userData.password
    })

    await request(app).post('/api/auth/logout').send({ token: loginRes.body.refreshToken })

    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .send({ token: loginRes.body.refreshToken })

    expect(refreshRes.status).toBe(401)
  })
})
