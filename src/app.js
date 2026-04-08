const express = require('express')
const app = express()

app.use(express.json())

app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/tasks', require('./routes/task.routes'))

app.get('/', (req, res) => {
  res.json({ message: 'API running ✅' })
})

module.exports = app