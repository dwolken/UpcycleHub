const path = require('path')
const express = require('express')
const cors = require('cors')
const session = require('express-session')
const authRouter = require('./routes/auth.routes')
const projectsRouter = require('./routes/projects.routes')
const usersRouter = require('./routes/users.routes')
const notFound = require('./middleware/notFound')
const errorHandler = require('./middleware/errorHandler')

const app = express()
const port = process.env.PORT || 3000

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
)
app.use(express.json())
app.use(
  session({
    name: 'upcyclehub.sid',
    secret: process.env.SESSION_SECRET || 'upcyclehub-dev-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    },
  }),
)
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')))

app.use('/api/auth', authRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/users', usersRouter)

app.use(notFound)
app.use(errorHandler)

app.listen(port, () => {
  console.log(`UpcycleHub API laeuft auf http://localhost:${port}`)
})
