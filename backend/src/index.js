const express = require('express')
const cors = require('cors')
const projectsRouter = require('./routes/projects.routes')
const notFound = require('./middleware/notFound')
const errorHandler = require('./middleware/errorHandler')

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use('/api/projects', projectsRouter)

app.use(notFound)
app.use(errorHandler)

app.listen(port, () => {
  console.log(`UpcycleHub API laeuft auf http://localhost:${port}`)
})
