import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

import folderRoutes from './routes/folderRoutes.js'
import fileRoutes from './routes/fileRoutes.js'

import http from 'http'
import { Server as SocketIOServer } from 'socket.io';
import firebase from "./firebase.js"

dotenv.config({ path: '.env.local' })
const app = express()
app.use(express.json())
app.use(cors())

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: "*",
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('listFiles', (folderId) => {
    
    firebase.listFiles(folderId, socket)
  });
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/folders', folderRoutes)
app.use('/files', fileRoutes)


const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))