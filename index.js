import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

import folderRoutes from './routes/folderRoutes.js'
import fileRoutes from './routes/fileRoutes.js'

dotenv.config({ path: '.env.local' })
const app = express()
const port = 5000
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/folders', folderRoutes)
app.use('/files', fileRoutes)

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})